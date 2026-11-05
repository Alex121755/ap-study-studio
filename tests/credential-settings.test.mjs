import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, stat, symlink, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { createCredentialSettingsHandler } from "../lib/credential-settings-core.ts";
import { isLocalRequest } from "../lib/local-access.ts";

const generatedKey = () => ["sk", randomBytes(32).toString("base64url")].join("-");
const request = (value, options = {}) => new Request("http://127.0.0.1:5173/api/settings/credentials", {
  method: "POST",
  headers: { Host: "127.0.0.1:5173", Origin: "http://127.0.0.1:5173", "Content-Type": "application/json", ...options.headers },
  body: typeof value === "string" ? value : JSON.stringify(value),
});
async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), "ap-atlas-settings-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const environment = {};
  return { directory, environment, handle: createCredentialSettingsHandler({ projectRoot: directory, environment, isLocal: isLocalRequest }) };
}

test("saving a user key creates a private local env file and returns no credential", async (t) => {
  const { directory, environment, handle } = await fixture(t);
  const value = generatedKey();
  const response = await handle(request({ key: value }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { configured: true });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(environment.OPENAI_API_KEY, value);
  assert.equal(await readFile(join(directory, ".env.local"), "utf8"), `OPENAI_API_KEY=${value}\n`);
  assert.equal((await stat(join(directory, ".env.local"))).mode & 0o777, 0o600);
  assert.deepEqual(await readdir(directory), [".env.local"]);
});

test("replacement removes duplicate old keys and preserves proxy, comments and multiline unrelated values", async (t) => {
  const { directory, environment, handle } = await fixture(t);
  const old = generatedKey();
  const value = generatedKey();
  const before = `# Local only\r\nAP_ATLAS_PROXY_URL=http://127.0.0.1:7897\r\nexport OPENAI_API_KEY='${old}'\r\nNOTES="first\r\nOPENAI_API_KEY=inside-note\r\nlast"\r\nOPENAI_API_KEY=${old}\r\nAP_ATLAS_PORT=5173\r\n`;
  await writeFile(join(directory, ".env.local"), before, { mode: 0o644 });
  assert.equal((await handle(request({ key: ` ${value} ` }))).status, 200);
  const saved = await readFile(join(directory, ".env.local"), "utf8");
  assert.equal(saved, before.replace(`export OPENAI_API_KEY='${old}'\r\n`, `OPENAI_API_KEY=${value}\r\n`).replace(`OPENAI_API_KEY=${old}\r\n`, ""));
  assert.equal(saved.includes(old), false);
  assert.equal(environment.OPENAI_API_KEY, value);
  assert.equal((await stat(join(directory, ".env.local"))).mode & 0o777, 0o600);
});

test("malformed inputs are rejected without echoing submitted values or writing local config", async (t) => {
  const { directory, environment, handle } = await fixture(t);
  const invalid = generatedKey() + "\nINJECTED=value";
  for (const value of [{ key: invalid }, { key: "short" }, { key: 12 }, {}, [], null, { key: "sk-" + "x".repeat(512) }]) {
    const response = await handle(request(value));
    assert.equal(response.status, 400);
    assert.equal((await response.text()).includes(invalid), false);
  }
  assert.equal((await handle(request("{not JSON"))).status, 400);
  assert.equal((await handle(request({ key: generatedKey() }, { headers: { "Content-Type": "text/plain" } }))).status, 415);
  assert.equal((await handle(request("x".repeat(2049)))).status, 413);
  assert.equal((await handle(request({ key: generatedKey() }, { headers: { "Content-Length": "2049" } }))).status, 413);
  assert.equal(environment.OPENAI_API_KEY, undefined);
  assert.deepEqual(await readdir(directory), []);
});

test("a foreign page cannot alter credentials and denial does not reveal submitted key", async (t) => {
  const { directory, environment, handle } = await fixture(t);
  const value = generatedKey();
  const response = await handle(request({ key: value }, { headers: { Origin: "https://example.com" } }));
  assert.equal(response.status, 403);
  assert.equal((await response.text()).includes(value), false);
  assert.equal(environment.OPENAI_API_KEY, undefined);
  assert.deepEqual(await readdir(directory), []);
});

test("symbolic links and oversized existing env files are rejected without modifying targets or runtime config", async (t) => {
  const { directory, environment, handle } = await fixture(t);
  const value = generatedKey();
  const other = join(directory, "other.txt");
  const path = join(directory, ".env.local");
  await writeFile(other, "preserve");
  await symlink(other, path);
  let response = await handle(request({ key: value }));
  assert.equal(response.status, 500);
  assert.equal((await response.text()).includes(directory), false);
  assert.equal(await readFile(other, "utf8"), "preserve");
  await rm(path);
  await writeFile(path, "x".repeat(65_537));
  response = await handle(request({ key: value }));
  assert.equal(response.status, 500);
  assert.equal((await stat(path)).size, 65_537);
  assert.equal(environment.OPENAI_API_KEY, undefined);
  assert.equal((await readdir(directory)).some((name) => name.endsWith(".tmp")), false);
});

test("concurrent saves are serialized and the last successful save controls disk and runtime", async (t) => {
  const { directory, environment, handle } = await fixture(t);
  const first = generatedKey();
  const second = generatedKey();
  const results = await Promise.all([handle(request({ key: first })), handle(request({ key: second }))]);
  assert.deepEqual(results.map((response) => response.status), [200, 200]);
  assert.equal(environment.OPENAI_API_KEY, second);
  assert.equal(await readFile(join(directory, ".env.local"), "utf8"), `OPENAI_API_KEY=${second}\n`);
  assert.deepEqual(await readdir(directory), [".env.local"]);
});
