export type ModelCatalogResult = { models: string[]; source: "api" | "stale" | "fallback"; error?: string };
export type ModelCatalogRequestOptions = { forceRefresh?: boolean };
type ResolverOptions = { fetcher?: typeof fetch; now?: () => number; ttlMs?: number; timeoutMs?: number };
type Entry = { expiresAt: number; result?: ModelCatalogResult; lastSuccess?: string[]; pending?: Promise<ModelCatalogResult> };
type DiscoveryResult = { models: string[]; error?: never } | { error: string; models?: never };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Listing a model is not a guarantee of endpoint access; exclude specialized endpoints. */
export function filterTutorModels(value: unknown, now = Date.now()): string[] {
  if (!record(value) || !Array.isArray(value.data) || value.data.length > 5_000) return [];
  const ids = new Set<string>();
  for (const model of value.data) {
    if (!record(model) || typeof model.id !== "string" || model.id.length > 120) continue;
    const id = model.id;
    if (!/^gpt-(?:4\.1|5|6)(?:[.-][a-z0-9]+)*$/.test(id)) continue;
    if (/(?:^|-)(?:audio|transcribe|realtime|tts|image|search|codex|pro|chat|deep-research|instruct|embedding)(?:-|$)/.test(id)) continue;
    if (typeof model.shutdown_date === "string") {
      const shutdown = Date.parse(model.shutdown_date);
      if (Number.isFinite(shutdown) && shutdown <= now) continue;
    }
    ids.add(id);
  }
  // Newer generations stay visible first; keep stable aliases ahead of dated snapshots.
  const version = (id: string) => /^gpt-(\d+)(?:\.(\d+))?/.exec(id)!;
  return [...ids].sort((a, b) => {
    const av = version(a), bv = version(b);
    const generation = Number(bv[1]) - Number(av[1]) || Number(bv[2] ?? 0) - Number(av[2] ?? 0);
    if (generation) return generation;
    const snapshot = (id: string) => /-\d{4}-\d{2}-\d{2}$/.test(id) ? 1 : 0;
    return snapshot(a) - snapshot(b) || b.localeCompare(a, "en", { numeric: true });
  }).slice(0, 80);
}

async function readModelList(response: Response): Promise<unknown> {
  if (Number(response.headers.get("content-length")) > 524_288 || !response.body) throw new Error("Invalid model list size");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 524_288) throw new Error("Model list too large");
      text += decoder.decode(part.value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export function createModelCatalogResolver(fallbackModels: readonly string[], options: ResolverOptions = {}) {
  const entries = new Map<string, Entry>();
  const now = options.now ?? Date.now;
  const fetcher = options.fetcher ?? fetch;
  const clone = (result: ModelCatalogResult): ModelCatalogResult => ({ ...result, models: [...result.models] });
  const fallback = (error: string): ModelCatalogResult => ({ models: [...fallbackModels], source: "fallback", error: `${error}；当前显示默认列表。` });

  async function discover(apiKey: string): Promise<DiscoveryResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8_000);
    try {
      const response = await fetcher("https://api.openai.com/v1/models", {
        method: "GET", headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }, signal: controller.signal,
      });
      if (!response.ok) {
        await response.body?.cancel().catch(() => {});
        return { error: response.status === 401 || response.status === 403
          ? "无法读取账户模型，请检查服务端凭据与权限"
          : response.status === 429 ? "模型列表暂时受限，请稍后刷新"
          : "模型列表暂时不可用" };
      }
      const models = filterTutorModels(await readModelList(response), now());
      return models.length ? { models } : { error: "账户未返回可用的文字辅导模型" };
    } catch {
      return { error: controller.signal.aborted ? "获取模型列表超时" : "无法获取模型列表" };
    } finally {
      clearTimeout(timer);
    }
  }

  return async function getModelCatalog(apiKey: string | undefined, requestOptions: ModelCatalogRequestOptions = {}): Promise<ModelCatalogResult> {
    const key = apiKey?.trim();
    if (!key) return fallback("服务端尚未配置 API key");
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
    const fingerprint = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const cached = entries.get(fingerprint);
    if (cached?.pending) return clone(await cached.pending);
    if (!requestOptions.forceRefresh && cached?.result && cached.expiresAt > now()) return clone(cached.result);
    if (!entries.has(fingerprint) && entries.size >= 4) entries.delete(entries.keys().next().value!);
    const entry: Entry = cached ?? { expiresAt: 0 };
    entry.pending = discover(key).then((discovered) => {
      let result: ModelCatalogResult;
      if (discovered.models) {
        entry.lastSuccess = [...discovered.models];
        result = { models: discovered.models, source: "api" };
      } else if (entry.lastSuccess) {
        result = { models: [...entry.lastSuccess], source: "stale", error: `${discovered.error}；暂用上次成功获取的模型列表，可重新刷新。` };
      } else {
        result = fallback(discovered.error);
      }
      entry.result = result;
      entry.expiresAt = now() + (result.source === "api" ? options.ttlMs ?? 300_000 : 30_000);
      entry.pending = undefined;
      return result;
    });
    entries.set(fingerprint, entry);
    return clone(await entry.pending);
  };
}
