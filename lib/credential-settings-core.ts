import { constants } from "node:fs";
import { lstat, open, realpath, rename, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

const BODY_LIMIT = 2_048;
const ENV_LIMIT = 65_536;
const writes = new Map<string, Promise<void>>();
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
type Environment = Record<string, string | undefined>;
type SettingsOptions = {
  projectRoot?: string;
  environment?: Environment;
  isLocal: (request: Request) => boolean;
};

class SettingsError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

/** Check syntax locally; model discovery subsequently checks provider permissions. */
function parseKey(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new SettingsError("请提供有效的 API key。");
  const input = (value as Record<string, unknown>).key;
  if (typeof input !== "string") throw new SettingsError("请提供有效的 API key。");
  const trimmed = input.trim();
  if (trimmed.length < 20 || trimmed.length > 512 || !/^sk-[A-Za-z0-9_-]+$/.test(trimmed)) {
    throw new SettingsError("API key 格式无效，请检查后重试。");
  }
  return trimmed;
}

async function readBody(request: Request): Promise<unknown> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") || "")) {
    throw new SettingsError("请使用 JSON 提交 API key。", 415);
  }
  const declared = request.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > BODY_LIMIT)) {
    throw new SettingsError("提交内容过大。", 413);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new SettingsError("请提供有效的 API key。");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > BODY_LIMIT) {
        await reader.cancel();
        throw new SettingsError("提交内容过大。", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new SettingsError("提交内容不是有效的 JSON。"); }
}

/** Preserve unrelated dotenv assignments, including quoted multiline values. */
function replaceKey(contents: string, value: string): string {
  const newline = contents.includes("\r\n") ? "\r\n" : "\n";
  const assignment = /^[ \t]*(?:export[ \t]+)?([A-Za-z_][A-Za-z0-9_.-]*)[ \t]*=[ \t]*/gm;
  const spans: { start: number; end: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = assignment.exec(contents))) {
    let end = assignment.lastIndex;
    const quote = contents[end];
    if (quote === '"' || quote === "'" || quote === "`") {
      let closed = false;
      for (end++; end < contents.length; end++) {
        if (contents[end] !== quote) continue;
        let precedingSlashes = 0;
        for (let i = end - 1; i >= 0 && contents[i] === "\\"; i--) precedingSlashes++;
        if (quote === '"' && precedingSlashes % 2 === 1) continue;
        closed = true;
        end++;
        break;
      }
      if (!closed) throw new Error("Invalid local environment format");
    }
    const lineEnd = contents.indexOf("\n", end);
    end = lineEnd === -1 ? contents.length : lineEnd + 1;
    if (match[1] === "OPENAI_API_KEY") spans.push({ start: match.index, end });
    assignment.lastIndex = end;
  }
  const replacement = `OPENAI_API_KEY=${value}${newline}`;
  if (!spans.length) return contents + (contents && !contents.endsWith("\n") ? newline : "") + replacement;
  let output = "";
  let offset = 0;
  for (const [index, span] of spans.entries()) {
    output += contents.slice(offset, span.start) + (index === 0 ? replacement : "");
    offset = span.end;
  }
  return output + contents.slice(offset);
}

async function fileState(path: string) {
  try {
    const stat = await lstat(path);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > ENV_LIMIT) throw new Error("Unsupported local configuration");
    return stat;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function persistKey(projectRoot: string, value: string): Promise<void> {
  // Canonicalize the trusted project directory before creating a sibling temporary file.
  const directory = await realpath(projectRoot);
  const target = resolve(directory, ".env.local");
  const previous = await fileState(target);
  let contents = "";
  if (previous) {
    const file = await open(target, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const stat = await file.stat();
      if (!stat.isFile() || stat.dev !== previous.dev || stat.ino !== previous.ino || stat.size > ENV_LIMIT) throw new Error("Local configuration changed");
      const buffer = Buffer.alloc(ENV_LIMIT + 1);
      let length = 0;
      while (length < buffer.length) {
        const read = await file.read(buffer, length, buffer.length - length, null);
        if (read.bytesRead === 0) break;
        length += read.bytesRead;
      }
      if (length > ENV_LIMIT) throw new Error("Local configuration too large");
      contents = new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, length));
    } finally { await file.close(); }
  }
  const next = replaceKey(contents, value);
  if (Buffer.byteLength(next, "utf8") > ENV_LIMIT) throw new Error("Local configuration too large");
  const temporary = resolve(directory, `.env.local.${randomUUID()}.tmp`);
  try {
    const file = await open(temporary, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
    try { await file.chmod(0o600); await file.writeFile(next, "utf8"); await file.sync(); }
    finally { await file.close(); }
    const current = await fileState(target);
    if (previous ? (!current || current.dev !== previous.dev || current.ino !== previous.ino || current.mtimeMs !== previous.mtimeMs || current.size !== previous.size) : !!current) {
      throw new Error("Local configuration changed");
    }
    await rename(temporary, target);
  } finally { await unlink(temporary).catch(() => undefined); }
}

/** Each project serializes atomic writes; a failed save never changes runtime config. */
export function createCredentialSettingsHandler(options: SettingsOptions) {
  // This is writable runtime configuration, never a file to collect into a build.
  const projectRoot = resolve(/* turbopackIgnore: true */ options.projectRoot ?? process.cwd());
  const environment = options.environment ?? process.env;
  return async function handle(request: Request): Promise<Response> {
    if (!options.isLocal(request)) return Response.json({ error: "请从本机 AP Atlas 页面设置 API key。" }, { status: 403, headers });
    try {
      if (request.method !== "POST") return Response.json({ error: "此接口仅接受 POST 请求。" }, { status: 405, headers: { ...headers, Allow: "POST" } });
      const value = parseKey(await readBody(request));
      const prior = writes.get(projectRoot) ?? Promise.resolve();
      const pending = prior.catch(() => undefined).then(async () => {
        await persistKey(projectRoot, value);
        environment.OPENAI_API_KEY = value;
      });
      writes.set(projectRoot, pending);
      try { await pending; }
      finally { if (writes.get(projectRoot) === pending) writes.delete(projectRoot); }
      return Response.json({ configured: true }, { headers });
    } catch (error) {
      if (error instanceof SettingsError) return Response.json({ error: error.message }, { status: error.status, headers });
      return Response.json({ error: "无法保存本机 API key，请检查项目目录权限后重试。" }, { status: 500, headers });
    }
  };
}
