import test from "node:test";
import assert from "node:assert/strict";
import { createModelCatalogResolver, filterTutorModels } from "../lib/model-catalog-core.ts";

const fallback = ["gpt-4.1-mini", "gpt-4.1", "gpt-5-mini"];
const listed = (...ids) => ({ data: ids.map((id) => ({ id })) });
const jsonResponse = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });

test("model filtering includes general text GPT families and excludes specialized, expired and malformed IDs", () => {
  const value = listed("gpt-4.1-mini", "gpt-4.1-2025-04-14", "gpt-5-mini", "gpt-5.4", "gpt-6.1-sol", "gpt-6-astra",
    "gpt-5-pro", "gpt-5.4-pro", "gpt-5-codex", "gpt-5-chat-latest", "gpt-6-audio", "gpt-6-realtime", "gpt-5-search", "gpt-5-image", "gpt-5-tts", "gpt-4o", "gpt-4.10", "gpt-5\n", "arbitrary");
  value.data.push({ id: "gpt-5.1", shutdown_date: "2020-01-01" }, { id: "gpt-4.1-mini" }, { id: "gpt-6-luna", shutdown_date: "2099-01-01" });
  const result = filterTutorModels(value);
  assert.deepEqual(new Set(result), new Set(["gpt-4.1-mini", "gpt-4.1-2025-04-14", "gpt-5-mini", "gpt-5.4", "gpt-6.1-sol", "gpt-6-astra", "gpt-6-luna"]));
  assert.equal(result[0], "gpt-6.1-sol");
  assert.equal(result.length, new Set(result).size);
  assert.deepEqual(filterTutorModels({ models: ["unexpected-schema"] }), []);
});

test("model options put numeric generations first and aliases ahead of snapshots in each generation", () => {
  assert.deepEqual(filterTutorModels(listed("gpt-4.1", "gpt-5.9", "gpt-5.10", "gpt-6", "gpt-6-astra", "gpt-6.1-sol-2026-01-01", "gpt-6.1-sol")),
    ["gpt-6.1-sol", "gpt-6.1-sol-2026-01-01", "gpt-6-astra", "gpt-6", "gpt-5.10", "gpt-5.9", "gpt-4.1"]);
});

test("model discovery uses server auth, coalesces concurrent reads and caches for five minutes", async () => {
  let now = 1_000;
  let calls = 0;
  const resolve = createModelCatalogResolver(fallback, { now: () => now, fetcher: async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/models");
    assert.equal(options.headers.Authorization, "Bearer private-key");
    calls++;
    await Promise.resolve();
    return jsonResponse(listed("gpt-4.1-mini", "gpt-6-astra"));
  } });
  const [first, second] = await Promise.all([resolve("private-key"), resolve("private-key")]);
  assert.deepEqual(first, { models: ["gpt-6-astra", "gpt-4.1-mini"], source: "api" });
  assert.deepEqual(first, second);
  assert.equal(calls, 1);
  first.models.push("do-not-mutate-cache");
  assert.equal((await resolve("private-key")).models.includes("do-not-mutate-cache"), false);
  now += 299_999;
  await resolve("private-key");
  assert.equal(calls, 1);
  now += 2;
  await resolve("private-key");
  assert.equal(calls, 2);
});

test("explicit refresh bypasses a fresh cache and coalesces concurrent forced and ordinary requests", async (t) => {
  // Isolate cache scheduling from native hashing completion order for this concurrency test.
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("key"));
  t.mock.method(crypto.subtle, "digest", async () => digest);
  let calls = 0;
  let release;
  let markStarted;
  const started = new Promise((done) => { markStarted = done; });
  const resolve = createModelCatalogResolver(fallback, { fetcher: async () => {
    calls++;
    if (calls === 1) return jsonResponse(listed("gpt-5-mini"));
    return new Promise((done) => {
      release = () => done(jsonResponse(listed("gpt-6.1-sol")));
      markStarted();
    });
  } });
  await resolve("key");
  const refreshed = resolve("key", { forceRefresh: true });
  const secondRefresh = resolve("key", { forceRefresh: true });
  await started;
  const ordinary = resolve("key");
  await Promise.resolve();
  assert.equal(calls, 2);
  release();
  for (const result of await Promise.all([refreshed, secondRefresh, ordinary])) {
    assert.deepEqual(result, { models: ["gpt-6.1-sol"], source: "api" });
  }
  await resolve("key");
  assert.equal(calls, 2);
});

test("failed refresh retains the last successful model list across repeated errors and can recover", async () => {
  let now = 0;
  let calls = 0;
  const resolve = createModelCatalogResolver(fallback, { now: () => now, fetcher: async () => {
    calls++;
    if (calls === 1) return jsonResponse(listed("gpt-6.1-sol", "gpt-5.6-sol"));
    if (calls === 4) return jsonResponse(listed("gpt-6.1-terra"));
    return new Response("private provider response", { status: 503 });
  } });
  const first = await resolve("key");
  const stale = await resolve("key", { forceRefresh: true });
  assert.equal(stale.source, "stale");
  assert.deepEqual(stale.models, first.models);
  assert.match(stale.error, /上次成功/);
  assert.ok(!stale.error.includes("默认列表"));
  assert.ok(!stale.error.includes("private provider response"));
  stale.models.push("mutated");
  assert.deepEqual((await resolve("key")).models, first.models);
  assert.equal(calls, 2);
  now += 30_001;
  assert.deepEqual((await resolve("key")).models, first.models);
  assert.equal(calls, 3);
  assert.deepEqual(await resolve("key", { forceRefresh: true }), { models: ["gpt-6.1-terra"], source: "api" });
});

test("explicit refresh also bypasses fallback error caching without sharing prior success across credentials", async () => {
  let calls = 0;
  const resolve = createModelCatalogResolver(fallback, { fetcher: async () => {
    calls++;
    return calls === 2 ? new Response("unavailable", { status: 429 }) : jsonResponse(listed("gpt-6.1-sol"));
  } });
  await resolve("first-key");
  const failed = await resolve("second-key");
  assert.equal(failed.source, "fallback");
  assert.deepEqual(failed.models, fallback);
  await resolve("second-key");
  assert.equal(calls, 2);
  assert.deepEqual(await resolve("second-key", { forceRefresh: true }), { models: ["gpt-6.1-sol"], source: "api" });
  assert.equal(calls, 3);
});

test("model discovery is credential-specific and bounds stored cache entries", async () => {
  let calls = 0;
  const resolve = createModelCatalogResolver(fallback, { fetcher: async () => { calls++; return jsonResponse(listed("gpt-5-mini")); } });
  for (const key of ["one", "two", "three", "four", "five"]) await resolve(key);
  await resolve("five");
  assert.equal(calls, 5);
  await resolve("one");
  assert.equal(calls, 6);
});

test("model discovery failures return explicit safe fallback and short-cache errors", async () => {
  let now = 0;
  let calls = 0;
  const resolve = createModelCatalogResolver(fallback, { now: () => now, fetcher: async () => { calls++; return new Response("private-key provider-details", { status: 401 }); } });
  const result = await resolve("private-key");
  assert.equal(result.source, "fallback");
  assert.deepEqual(result.models, fallback);
  assert.match(result.error, /默认列表/);
  assert.ok(!JSON.stringify(result).includes("private-key"));
  assert.ok(!JSON.stringify(result).includes("provider-details"));
  await resolve("private-key");
  assert.equal(calls, 1);
  now += 30_001;
  await resolve("private-key");
  assert.equal(calls, 2);
});

test("model discovery handles missing config, invalid schemas and timeouts without exposing exceptions", async () => {
  const missing = createModelCatalogResolver(fallback, { fetcher: async () => { throw new Error("should not fetch"); } });
  assert.equal((await missing(undefined)).source, "fallback");
  const empty = createModelCatalogResolver(fallback, { fetcher: async () => jsonResponse(listed("gpt-6-audio")) });
  assert.equal((await empty("key")).source, "fallback");
  const timeout = createModelCatalogResolver(fallback, { timeoutMs: 5, fetcher: async (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(new Error("private network details")), { once: true })) });
  const result = await timeout("key");
  assert.equal(result.source, "fallback");
  assert.match(result.error, /超时/);
});
