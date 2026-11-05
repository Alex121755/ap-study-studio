import test from "node:test";
import assert from "node:assert/strict";
import { isLocalRequest, localAccessDenied, normalizeLocalRequest } from "../lib/local-access.ts";

const request = (url = "http://127.0.0.1:5173/api/chat", headers = {}) => new Request(url, {
  headers: { Host: "127.0.0.1:5173", ...headers },
});

test("local access accepts matching loopback hosts and same-origin browser calls", () => {
  for (const host of ["127.0.0.1:5173", "localhost:5173", "[::1]:5173"]) {
    assert.equal(isLocalRequest(request(`http://${host}/api/status`, { Host: host })), true);
    assert.equal(isLocalRequest(request(`http://${host}/api/chat`, { Host: host, Origin: `http://${host}`, "Sec-Fetch-Site": "same-origin" })), true);
  }
});

test("local access tolerates Next URL loopback normalization while checking the browser origin against Host", () => {
  assert.equal(isLocalRequest(request("http://localhost:5173/api/status")), true);
  assert.equal(isLocalRequest(request("http://localhost:5173/api/chat", { Origin: "http://127.0.0.1:5173" })), true);
  assert.equal(isLocalRequest(request("http://localhost:5173/api/chat", { Origin: "http://localhost:5173" })), false);
});

test("normalization preserves body, headers and cancellation using the validated browser host", async () => {
  const aborter = new AbortController();
  const original = new Request("http://localhost:5173/api/chat", {
    method: "POST", headers: { Host: "127.0.0.1:5173", Origin: "http://127.0.0.1:5173", "Content-Type": "application/json" },
    body: JSON.stringify({ messages: ["question"] }), signal: aborter.signal,
  });
  const normalized = normalizeLocalRequest(original);
  assert.equal(normalized.url, "http://127.0.0.1:5173/api/chat");
  assert.equal(normalized.headers.get("origin"), new URL(normalized.url).origin);
  assert.equal(normalized.method, "POST");
  assert.deepEqual(await normalized.json(), { messages: ["question"] });
  aborter.abort();
  assert.equal(normalized.signal.aborted, true);
  assert.throws(() => normalizeLocalRequest(request(undefined, { Origin: "https://evil.example" })));
});

test("local access fails closed for cloud requests, host rewriting and foreign origins", () => {
  for (const input of [
    request("https://ap-atlas.example/api/chat", { Host: "ap-atlas.example" }),
    request("https://ap-atlas.example/api/chat"),
    request("http://127.0.0.1:5173/api/chat", { Host: "evil.example:5173" }),
    request("http://127.0.0.1:5173/api/chat", { Host: "127.0.0.1:3000" }),
    request("http://127.0.0.1:3000/api/chat", { Host: "127.0.0.1:3000" }),
    request(undefined, { Origin: "https://evil.example" }),
    request(undefined, { Origin: "null" }),
    request(undefined, { Origin: "http://localhost:5173" }),
    request(undefined, { "Sec-Fetch-Site": "cross-site" }),
    new Request("http://127.0.0.1:5173/api/chat"),
    request(undefined, { Host: "127.0.0.1:5173@evil.example" }),
    request(undefined, { Host: "127.0.0.1:5173/" }),
  ]) assert.equal(isLocalRequest(input), false, input.url + " " + input.headers.get("host"));
});

test("local access rejects invalid port configuration and respects an explicitly configured local port", () => {
  const previous = process.env.AP_ATLAS_PORT;
  try {
    process.env.AP_ATLAS_PORT = "5432";
    assert.equal(isLocalRequest(request("http://127.0.0.1:5432/api/status", { Host: "127.0.0.1:5432" })), true);
    assert.equal(isLocalRequest(request()), false);
    for (const value of ["NaN", "0", "65536", "5173/evil"]) {
      process.env.AP_ATLAS_PORT = value;
      assert.equal(isLocalRequest(request()), false);
    }
  } finally {
    if (previous === undefined) delete process.env.AP_ATLAS_PORT;
    else process.env.AP_ATLAS_PORT = previous;
  }
});

test("denial response reveals no secret or account information", async () => {
  const response = localAccessDenied();
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match((await response.json()).error, /本机/);
});
