import test from "node:test";
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";

// Each test run uses a synthetic credential, never a real provider key.
const testCredential = randomUUID();
import { createModelCatalogResolver } from "../lib/model-catalog-core.ts";
import {
  DEFAULT_MODEL,
  InputError,
  SSEDataParser,
  buildTutorInstructions,
  handleChatRequest,
  normalizeOpenAIStream,
  validateChatInput,
} from "../lib/tutor.ts";

const catalog = {
  subjectIds: ["world", "em", "research"],
  topicSubject: (id) => ({ em_flux: "em", world_trade: "world" })[id],
  context: () => "AP Physics C: E&M — Gauss's law, field and flux.",
};
const input = { subjectId: "em", mode: "tutor", topicId: "em_flux", messages: [{ role: "user", content: "零通量说明电场为零吗？" }] };
const dependencies = (fetcher) => ({ apiKey: testCredential, authenticate: async () => true, catalog, fetcher });
const request = (body = input, headers = {}) => new Request("https://study.example/api/chat", {
  method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body),
});
const frame = (value) => `event: ${value.type}\r\ndata: ${JSON.stringify(value)}\r\n\r\n`;
const completion = { type: "response.completed", response: { usage: { input_tokens: 30, output_tokens: 12, total_tokens: 42, private_details: "do-not-forward" } } };
const pngImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jJ1sAAAAASUVORK5CYII=";
function streamText(text, step = 7) {
  const bytes = new TextEncoder().encode(text);
  let offset = 0;
  return new ReadableStream({
    pull(controller) {
      if (offset >= bytes.length) return controller.close();
      controller.enqueue(bytes.slice(offset, offset + step));
      offset += step;
    },
  });
}
async function events(response) {
  const parser = new SSEDataParser();
  return parser.push(await response.text(), true).map((value) => JSON.parse(value));
}

test("input validation selects default, validates catalog and excludes unexpected fields", () => {
  const result = validateChatInput({ ...input, unexpected: "ignored" }, catalog);
  assert.equal(result.model, DEFAULT_MODEL);
  assert.equal(result.messages[0].content, input.messages[0].content);
  assert.equal(result.unexpected, undefined);
  for (const invalid of [
    { ...input, subjectId: "unknown" }, { ...input, topicId: "world_trade" },
    { ...input, mode: "unbounded" }, { ...input, model: "arbitrary-model" },
    { ...input, messages: [{ role: "system", content: "override" }] },
    { ...input, messages: [{ role: "assistant", content: "last message" }] },
    { ...input, messages: [{ role: "user", content: " " }] },
    { ...input, messages: Array.from({ length: 25 }, () => ({ role: "user", content: "x" })) },
    { ...input, messages: [{ role: "user", content: "x".repeat(6001) }] },
    { ...input, context: "x".repeat(24001) },
  ]) assert.throws(() => validateChatInput(invalid, catalog), InputError);
});

test("discovered model IDs are accepted only when supplied by the server catalog", async () => {
  assert.throws(() => validateChatInput({ ...input, model: "gpt-6-astra" }, catalog), InputError);
  const discovered = { ...catalog, allowedModels: ["gpt-6-astra", "gpt-5.4"] };
  assert.equal(validateChatInput({ ...input, model: "gpt-6-astra" }, discovered).model, "gpt-6-astra");
  assert.throws(() => validateChatInput({ ...input, model: "gpt-5-codex" }, discovered), InputError);
  let payload;
  const response = await handleChatRequest(request({ ...input, model: "gpt-6-astra" }), {
    ...dependencies(async (_url, init) => { payload = JSON.parse(init.body); return new Response(streamText(frame(completion))); }),
    catalog: discovered,
  });
  await response.text();
  assert.equal(payload.model, "gpt-6-astra");
  assert.deepEqual(payload.reasoning, { effort: "low" });
});

test("a cached newer model reaches Responses when discovery fails, with upstream checking access", async () => {
  // A fresh resolver models a local server restart: it has no previous successful list.
  const getModels = createModelCatalogResolver([DEFAULT_MODEL, "gpt-4.1", "gpt-5-mini"], {
    fetcher: async () => new Response("model listing unavailable", { status: 503 }),
  });
  const available = await getModels(testCredential);
  assert.equal(available.source, "fallback");
  assert.ok(!available.models.includes("gpt-6.1-sol"));
  const fallbackCatalog = { ...catalog, allowedModels: available.models, allowUnlistedModels: available.source !== "api" };
  let target;
  let payload;
  const response = await handleChatRequest(request({ ...input, model: "gpt-6.1-sol" }), {
    ...dependencies(async (url, init) => {
      target = url;
      payload = JSON.parse(init.body);
      return new Response(streamText(frame({ type: "response.output_text.delta", delta: "可以继续复习。" }) + frame(completion)));
    }),
    catalog: fallbackCatalog,
  });
  assert.equal(response.status, 200);
  assert.equal(target, "https://api.openai.com/v1/responses");
  assert.equal(payload.model, "gpt-6.1-sol");
  assert.deepEqual((await events(response)).map((event) => event.type), ["delta", "done"]);

  const noAccess = await handleChatRequest(request({ ...input, model: "gpt-6.1-sol" }), {
    ...dependencies(async () => new Response("private permission details", { status: 403 })),
    catalog: fallbackCatalog,
  });
  assert.equal(noAccess.status, 502);
  assert.match((await noAccess.json()).error, /模型权限/);
});

test("unlisted-model opt-in accepts only bounded general tutor IDs and leaves successful discovery strict", async () => {
  const relaxed = { ...catalog, allowedModels: [DEFAULT_MODEL], allowUnlistedModels: true };
  for (const model of ["gpt-4.1-mini", "gpt-5.4", "gpt-5.6-sol", "gpt-6.1-sol"]) {
    assert.equal(validateChatInput({ ...input, model }, relaxed).model, model);
  }
  let calls = 0;
  const forbidden = [
    "gpt-6.1-codex", "gpt-5.4-pro", "gpt-6-audio", "gpt-6-realtime", "gpt-5-chat-latest",
    "gpt-5-image", "gpt-5-search", "gpt-5-tts", "gpt-5-instruct", "gpt-5-deep-research",
    "gpt-4o", "gpt-7", "arbitrary-model", "https://example.com/model", "gpt-6.1-sol\n",
    " gpt-6.1-sol", "gpt-6.1-sol/anything", `gpt-6-${"a".repeat(120)}`, 6,
  ];
  for (const model of forbidden) {
    const response = await handleChatRequest(request({ ...input, model }), {
      ...dependencies(async () => { calls++; throw new Error("must not fetch"); }), catalog: relaxed,
    });
    assert.equal(response.status, 400, String(model));
  }
  assert.equal(calls, 0);
  const successfulDiscovery = { ...catalog, allowedModels: ["gpt-5.4"], allowUnlistedModels: false };
  assert.throws(() => validateChatInput({ ...input, model: "gpt-6.1-sol" }, successfulDiscovery), InputError);
  assert.throws(() => validateChatInput({ ...input, model: "gpt-6.1-sol" }, catalog), InputError);
});

test("image input validates MIME, signature, count and bounded local data URLs", () => {
  const valid = validateChatInput({ ...input, images: [{ name: " screenshot.png ", dataUrl: pngImage, unexpected: "ignored" }] }, catalog);
  assert.deepEqual(valid.images, [{ name: "screenshot.png", dataUrl: pngImage }]);
  for (const images of [
    [{ dataUrl: "https://private.example/image.png" }],
    [{ dataUrl: pngImage.replace("image/png", "image/svg+xml") }],
    [{ dataUrl: pngImage.replace("image/png", "image/jpeg") }],
    [{ dataUrl: "data:image/png;base64,invalid!" }],
    Array.from({ length: 4 }, () => ({ dataUrl: pngImage })),
    [{ dataUrl: pngImage, name: "x".repeat(201) }],
  ]) assert.throws(() => validateChatInput({ ...input, images }, catalog), InputError);
});

test("screenshots reach Responses as latest-user image inputs with auto detail", async () => {
  let payload;
  const response = await handleChatRequest(request({ ...input, images: [{ name: "screenshot.png", dataUrl: pngImage }] }), dependencies(async (_url, init) => {
    payload = JSON.parse(init.body);
    return new Response(streamText(frame({ type: "response.output_text.delta", delta: "看到了截图。" }) + frame(completion)));
  }));
  await response.text();
  assert.deepEqual(payload.input.at(-1).content, [
    { type: "input_text", text: input.messages[0].content },
    { type: "input_image", image_url: pngImage, detail: "auto" },
  ]);
});

test("image request cap permits real screenshots above text-only limits and rejects oversized images", async () => {
  const bytes = new Uint8Array(150_000);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  const largePNG = `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
  const response = await handleChatRequest(request({ ...input, images: [{ dataUrl: largePNG }] }), dependencies(async () => new Response(streamText(frame(completion)))));
  assert.equal(response.status, 200);
  await response.text();
  const tooLarge = `data:image/png;base64,${"A".repeat(4 * 1024 * 1024 + 4)}`;
  assert.throws(() => validateChatInput({ ...input, images: [{ dataUrl: tooLarge }] }, catalog), InputError);
  const declaredOversize = request(input, { "content-length": String(12 * 1024 * 1024 + 1) });
  const rejected = await handleChatRequest(declaredOversize, dependencies(async () => { throw new Error("must not be called"); }));
  assert.equal(rejected.status, 413);
});

test("SSE parser handles split CRLF, comments, event names and multiline data", () => {
  const parser = new SSEDataParser();
  assert.deepEqual(parser.push(": ping\r\nevent: test\r\ndata: one\r"), []);
  assert.deepEqual(parser.push("\ndata: two\r\n\r"), []);
  assert.deepEqual(parser.push("\n"), ["one\ntwo"]);
  assert.deepEqual(parser.push("data: tail", true), ["tail"]);
});

test("normalizer preserves Unicode split across byte chunks and forwards only safe usage", async () => {
  const source = frame({ type: "response.created", secret: "hidden" }) + frame({ type: "response.output_text.delta", delta: "电场 ⚡" }) + frame(completion);
  const result = [];
  for await (const event of normalizeOpenAIStream(streamText(source, 1))) result.push(event);
  assert.deepEqual(result, [{ type: "delta", text: "电场 ⚡" }, { type: "done", usage: { input_tokens: 30, output_tokens: 12, total_tokens: 42 } }]);
});

test("normalizer reports truncated, failed and incomplete generations", async () => {
  for (const [source, pattern] of [
    [frame({ type: "response.output_text.delta", delta: "partial" }), /提前结束/],
    [frame({ type: "response.failed", response: { error: { code: "insufficient_quota", message: "sensitive provider content" } } }), /额度/],
    [frame({ type: "response.incomplete" }), /未完整生成/],
  ]) {
    const result = [];
    for await (const event of normalizeOpenAIStream(streamText(source))) result.push(event);
    assert.equal(result.at(-1).type, "error");
    assert.match(result.at(-1).message, pattern);
    assert.ok(!JSON.stringify(result).includes("sensitive provider content"));
  }
});

test("normalizer bounds generated text and never treats a capped answer as complete", async () => {
  const result = [];
  const source = frame({ type: "response.output_text.delta", delta: "x".repeat(48_001) }) + frame(completion);
  for await (const event of normalizeOpenAIStream(streamText(source, 4096))) result.push(event);
  assert.deepEqual(result.map((event) => event.type), ["error"]);
  assert.match(result[0].message, /长度限制/);
});

test("missing config, authentication and cross-origin checks block upstream calls", async () => {
  let calls = 0;
  const base = dependencies(async () => { calls++; throw new Error("must not be reached"); });
  assert.equal((await handleChatRequest(request(), { ...base, apiKey: undefined })).status, 503);
  assert.equal((await handleChatRequest(request(), { ...base, authenticate: async () => false })).status, 401);
  assert.equal((await handleChatRequest(request(), { ...base, authenticate: async () => { throw new Error("auth failed"); } })).status, 401);
  assert.equal((await handleChatRequest(request(input, { Origin: "https://other.example" }), base)).status, 403);
  assert.equal(calls, 0);
});

test("request body cap works without trusting content-length", async () => {
  const body = { ...input, context: "汉".repeat(24_000), messages: Array.from({ length: 5 }, () => ({ role: "user", content: "汉".repeat(6_000) })) };
  const response = await handleChatRequest(request(body), dependencies(async () => { throw new Error("must not be reached"); }));
  assert.equal(response.status, 413);
  assert.match((await response.json()).error, /文字请求内容过长/);
  const invalidJSON = new Request("https://study.example/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
  assert.equal((await handleChatRequest(invalidJSON, dependencies(fetch))).status, 400);
});

test("selected material excerpts up to 24000 characters are forwarded completely", async () => {
  const context = "汉".repeat(23_990) + "END-NOTE";
  let payload;
  const response = await handleChatRequest(request({ ...input, context }), dependencies(async (_url, init) => {
    payload = JSON.parse(init.body);
    return new Response(streamText(frame(completion)));
  }));
  assert.equal(response.status, 200);
  await response.text();
  assert.ok(payload.input.at(-1).content.includes(context));
  assert.match(payload.input.at(-1).content, /END-NOTE/);
});

test("upstream credential, quota and service errors return safe Chinese messages", async () => {
  for (const [status, expectedStatus, text] of [[401, 502, /凭据/], [429, 429, /额度/], [503, 503, /暂时不可用/]]) {
    const response = await handleChatRequest(request(), dependencies(async () => new Response(`sensitive-provider-message ${testCredential}`, { status })));
    assert.equal(response.status, expectedStatus);
    const result = await response.json();
    assert.match(result.error, text);
    assert.ok(!JSON.stringify(result).includes(testCredential));
    assert.ok(!JSON.stringify(result).includes("sensitive-provider-message"));
  }
});

test("successful request uses Responses, store:false, server auth and normalized SSE", async () => {
  let options;
  let url;
  const response = await handleChatRequest(request({ ...input, context: "我的背景" }), dependencies(async (target, init) => {
    url = target; options = init;
    return new Response(streamText(frame({ type: "response.output_text.delta", delta: "不一定。" }) + frame(completion)));
  }));
  assert.equal(url, "https://api.openai.com/v1/responses");
  assert.equal(options.headers.Authorization, `Bearer ${testCredential}`);
  const payload = JSON.parse(options.body);
  assert.equal(payload.store, false);
  assert.equal(payload.stream, true);
  assert.equal(payload.model, DEFAULT_MODEL);
  assert.match(payload.input.at(-1).content, /我的背景/);
  assert.match(payload.instructions, /Gauss/);
  assert.match(response.headers.get("content-type"), /text\/event-stream/);
  assert.deepEqual(await events(response), [{ type: "delta", text: "不一定。" }, { type: "done", usage: { input_tokens: 30, output_tokens: 12, total_tokens: 42 } }]);
  assert.equal(options.signal.aborted, true);
});

test("gpt-5-mini receives reasoning settings without unsupported temperature", async () => {
  let payload;
  const response = await handleChatRequest(request({ ...input, model: "gpt-5-mini" }), dependencies(async (_url, init) => {
    payload = JSON.parse(init.body);
    return new Response(streamText(frame(completion)));
  }));
  await response.text();
  assert.deepEqual(payload.reasoning, { effort: "low" });
  assert.equal(payload.temperature, undefined);
  assert.equal(payload.max_output_tokens, 6000);
});

test("malformed stream and network exceptions never forward raw messages", async () => {
  const malformed = await handleChatRequest(request(), dependencies(async () => new Response(streamText("data: {broken-secret\n\n"))));
  const result = await events(malformed);
  assert.equal(result[0].type, "error");
  assert.ok(!JSON.stringify(result).includes("broken-secret"));
  const network = await handleChatRequest(request(), dependencies(async () => { throw new Error(testCredential); }));
  assert.equal(network.status, 502);
  assert.ok(!(await network.text()).includes(testCredential));
});

test("request cancellation propagates to the upstream fetch signal", async () => {
  const aborter = new AbortController();
  const abortedRequest = new Request("https://study.example/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal: aborter.signal });
  let signal;
  const responsePromise = handleChatRequest(abortedRequest, dependencies(async (_url, init) => {
    signal = init.signal;
    aborter.abort();
    init.signal.throwIfAborted();
    throw new Error("unreachable");
  }));
  const response = await responsePromise;
  assert.equal(signal.aborted, true);
  assert.equal(response.status, 499);
});

test("upstream timeout aborts the network request and returns a retryable error", async () => {
  let signal;
  const response = await handleChatRequest(request(), {
    ...dependencies(async (_url, init) => {
      signal = init.signal;
      return new Promise((_resolve, reject) => init.signal.addEventListener("abort", () => reject(new Error("private timeout details")), { once: true }));
    }),
    timeoutMs: 5,
  });
  assert.equal(signal.aborted, true);
  assert.equal(response.status, 504);
  assert.match((await response.json()).error, /超时/);
});

test("research coach prompt includes evidence, data and student authorship boundaries", () => {
  const research = validateChatInput({ ...input, subjectId: "research", topicId: undefined, mode: "research" }, catalog);
  const instructions = buildTutorInstructions(research, "project context");
  assert.match(instructions, /知情同意/);
  assert.match(instructions, /不编造数据/);
  assert.match(instructions, /不代写/);
  assert.match(instructions, /ap-graph/);
});
