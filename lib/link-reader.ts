/** Public-page reader. Extracted content is untrusted source text, never HTML or instructions. */
export const MAX_PAGE_BYTES = 512 * 1024;
export const MAX_LINK_TEXT = 16_000;
const MAX_REQUEST_BYTES = 4096;
const DNS_ENDPOINT = 'https://cloudflare-dns.com/dns-query';
const LOCAL_SUFFIXES = ['localhost', 'local', 'localdomain', 'internal', 'intranet', 'lan', 'home', 'test', 'invalid', 'example', 'onion', 'arpa'];
const REDIRECTS = new Set([301, 302, 303, 307, 308]);
const HEADERS = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

export class LinkReaderError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.name = 'LinkReaderError'; this.status = status; }
}

export type LinkMaterial = { title: string; text: string; url: string };
type Fetcher = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

/** Normalizes the URL and removes fragments; only DNS hostnames on public HTTPS are accepted. */
export function validatePublicURL(value: unknown): URL {
  if (typeof value !== 'string' || !value.trim() || value.length > 2048) throw new LinkReaderError('请输入不超过 2048 字符的公开网页 HTTPS 链接。');
  const raw = value.trim();
  if (/[\u0000-\u0020\u007f\\]/.test(raw)) throw new LinkReaderError('链接包含无效字符，请重新复制完整 HTTPS 地址。');
  let url: URL;
  try { url = new URL(raw); } catch { throw new LinkReaderError('链接格式不正确，请提供完整 HTTPS 地址。'); }
  if (url.protocol !== 'https:' || (url.port && url.port !== '443') || url.username || url.password) {
    throw new LinkReaderError('只支持标准 443 端口、不含用户名或密码的 HTTPS 公开网页。');
  }
  const host = url.hostname.toLowerCase();
  const labels = host.split('.');
  if (host.length > 253 || labels.length < 2 || /^[\d.]+$/.test(host) || host.includes(':') ||
      labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label)) ||
      !/^[a-z][a-z0-9-]{1,62}$/i.test(labels.at(-1) ?? '') ||
      LOCAL_SUFFIXES.some(suffix => host === suffix || host.endsWith(`.${suffix}`))) {
    throw new LinkReaderError('此地址不是可读取的公开域名；不支持 IP、单段主机名或本地/内部地址。');
  }
  url.hash = '';
  return url;
}

function ipv4Parts(value: string): number[] | null {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value)) return null;
  const parts = value.split('.').map(Number);
  return parts.every(n => n >= 0 && n <= 255) ? parts : null;
}

function ipv6Parts(value: string): number[] | null {
  let input = value.toLowerCase();
  if (!/^[0-9a-f:.]+$/.test(input) || !input.includes(':')) return null;
  if (input.includes('.')) {
    const split = input.lastIndexOf(':');
    const v4 = ipv4Parts(input.slice(split + 1));
    if (!v4) return null;
    input = `${input.slice(0, split)}:${((v4[0] << 8) | v4[1]).toString(16)}:${((v4[2] << 8) | v4[3]).toString(16)}`;
  }
  if ((input.match(/::/g) ?? []).length > 1) return null;
  const compressed = input.includes('::');
  const [left, right = ''] = input.split('::');
  const a = left ? left.split(':') : [];
  const b = right ? right.split(':') : [];
  if ([...a, ...b].some(part => !/^[0-9a-f]{1,4}$/.test(part))) return null;
  const missing = 8 - a.length - b.length;
  if ((compressed && missing < 1) || (!compressed && missing !== 0)) return null;
  return [...a.map(part => parseInt(part, 16)), ...Array(compressed ? missing : 0).fill(0), ...b.map(part => parseInt(part, 16))];
}

/** Conservative policy: IPv4 public unicast or IPv6 global unicast, excluding special ranges. */
export function isPublicIPAddress(value: string): boolean {
  const v4 = ipv4Parts(value);
  if (v4) {
    const [a, b, c] = v4;
    return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) || (a === 192 && b === 88 && c === 99) ||
      (a === 198 && (b === 18 || b === 19)) || (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113));
  }
  const v6 = ipv6Parts(value);
  if (!v6 || (v6[0] & 0xe000) !== 0x2000) return false;
  return !((v6[0] === 0x2001 && v6[1] < 0x0200) ||
    (v6[0] === 0x2001 && v6[1] === 0x0db8) || v6[0] === 0x2002 ||
    v6[0] === 0x3ffe || (v6[0] === 0x3fff && v6[1] < 0x1000));
}

function abortError(): LinkReaderError { return new LinkReaderError('读取网页超时，请稍后重试或直接粘贴相关摘录。', 504); }

async function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) throw abortError();
  return new Promise<T>((resolve, reject) => {
    const aborted = () => reject(abortError());
    signal.addEventListener('abort', aborted, { once: true });
    promise.then(value => { signal.removeEventListener('abort', aborted); resolve(value); }, error => { signal.removeEventListener('abort', aborted); reject(error); });
  });
}

async function readBody(response: Response | Request, maxBytes: number, signal: AbortSignal): Promise<string> {
  const length = response.headers.get('content-length');
  if (length && /^\d+$/.test(length) && Number(length) > maxBytes) {
    void response.body?.cancel().catch(() => {});
    throw new LinkReaderError('网页或请求内容过大，请改为粘贴较短摘录。', 413);
  }
  const reader = response.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder('utf-8');
  let bytes = 0;
  let result = '';
  try {
    while (true) {
      const { done, value } = await abortable(reader.read(), signal);
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) throw new LinkReaderError('网页内容超过 512 KB，请改为粘贴相关摘录。', 413);
      result += decoder.decode(value, { stream: true });
    }
    return result + decoder.decode();
  } finally {
    void reader.cancel().catch(() => {});
    try { reader.releaseLock(); } catch { /* An aborted read may still be settling. */ }
  }
}

async function ensurePublicDNS(host: string, fetcher: Fetcher, signal: AbortSignal): Promise<void> {
  const answers = await Promise.all(['A', 'AAAA'].map(async type => {
    const endpoint = new URL(DNS_ENDPOINT);
    endpoint.searchParams.set('name', host);
    endpoint.searchParams.set('type', type);
    const response = await abortable(fetcher(endpoint.toString(), {
      method: 'GET', redirect: 'error', credentials: 'omit', signal,
      headers: { Accept: 'application/dns-json' },
    }), signal);
    if (!response.ok) throw new LinkReaderError('无法安全验证网页域名，请稍后重试或粘贴摘录。', 502);
    let data: { Status?: number; Answer?: { type?: number; data?: string }[] };
    try { data = JSON.parse(await readBody(response, 64 * 1024, signal)); } catch (error) {
      if (error instanceof LinkReaderError) throw error;
      throw new LinkReaderError('无法安全验证网页域名，请粘贴相关摘录。', 502);
    }
    if (!data || data.Status !== 0 || (data.Answer !== undefined && !Array.isArray(data.Answer))) throw new LinkReaderError('网页域名不存在或暂时无法解析，请核对链接。', 422);
    return data.Answer ?? [];
  }));
  const records = answers.flat();
  let addressCount = 0;
  for (const answer of records) {
    if (!answer || typeof answer !== 'object') throw new LinkReaderError('无法安全验证网页域名。', 502);
    if (answer.type === 5) {
      if (typeof answer.data !== 'string' || !/^[a-z0-9.-]+\.?$/i.test(answer.data)) throw new LinkReaderError('网页域名解析结果不安全。', 422);
      validatePublicURL(`https://${answer.data.replace(/\.$/, '')}/`);
    }
    if (answer.type === 1 || answer.type === 28) {
      if (typeof answer.data !== 'string' || !isPublicIPAddress(answer.data)) throw new LinkReaderError('此域名指向内部、保留或非公开网络地址，无法读取。', 422);
      addressCount++;
    }
  }
  if (!addressCount) throw new LinkReaderError('网页域名没有可用的公开地址，请核对链接或粘贴摘录。', 422);
}

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ensp: ' ', emsp: ' ', thinsp: ' ',
  hellip: '…', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  bull: '•', middot: '·', copy: '©', reg: '®', deg: '°', times: '×', divide: '÷', plusmn: '±',
};

export function decodeHTMLEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi, (match, entity: string) => {
    if (entity.startsWith('#')) {
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : ' ';
    }
    return ENTITIES[entity.toLowerCase()] ?? match;
  });
}

function cleanText(value: string): string {
  return decodeHTMLEntities(value).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/[ \t\f\v]+/g, ' ').replace(/ *\r?\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Lightweight extraction only; returns plain strings and never executes or returns active HTML. */
export function extractReadableText(source: string, contentType: string, url: string): LinkMaterial {
  const fallback = new URL(url).hostname;
  if (contentType.split(';')[0].trim().toLowerCase() === 'text/plain') {
    return { title: fallback, text: cleanText(source).slice(0, MAX_LINK_TEXT), url };
  }
  let html = source.replace(/<!--[\s\S]*?(?:-->|$)/g, '');
  const title = cleanText((html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1] ?? '').replace(/<[^>]*>/g, ' ')).slice(0, 200) || fallback;
  html = html.replace(/<(script|style|noscript|svg|canvas|template|iframe|object|nav|header|footer|form|button)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*$/gi, ' ');
  html = html.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i)?.[1] ?? html;
  const main = html.match(/<(article|main)\b[^>]*>([\s\S]*?)<\/\1\s*>/i);
  if (main) html = main[2];
  const text = cleanText(html.replace(/<br\b[^>]*\/?\s*>|<\/?(?:p|div|section|article|main|h[1-6]|li|ul|ol|tr|blockquote|pre|hr)\b[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')).slice(0, MAX_LINK_TEXT);
  return { title, text, url };
}

/**
 * DNS is checked before every hop. Standard hostname fetch cannot pin the checked
 * address: DNS rebinding has a TOCTOU window. Hosting network restrictions remain
 * a necessary second layer; this helper must not be used as an unrestricted proxy.
 */
export async function readPublicLink(value: unknown, options: { fetcher?: Fetcher; signal?: AbortSignal; timeoutMs?: number } = {}): Promise<LinkMaterial> {
  const fetcher = options.fetcher ?? fetch;
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timer = setTimeout(abort, Math.min(options.timeoutMs ?? 8000, 8000));
  try {
    let url = validatePublicURL(value);
    for (let redirects = 0; redirects <= 3; redirects++) {
      await ensurePublicDNS(url.hostname, fetcher, controller.signal);
      const response = await abortable(fetcher(url.toString(), {
        method: 'GET', redirect: 'manual', credentials: 'omit', signal: controller.signal,
        headers: { Accept: 'text/html, text/plain;q=0.9' },
      }), controller.signal);
      if (REDIRECTS.has(response.status)) {
        void response.body?.cancel().catch(() => {});
        if (redirects === 3) throw new LinkReaderError('网页跳转次数过多，请使用最终公开页面链接或粘贴摘录。', 422);
        const location = response.headers.get('location');
        if (!location) throw new LinkReaderError('网页跳转地址无效，请重新复制链接。', 422);
        let next: URL;
        try { next = new URL(location, url); } catch { throw new LinkReaderError('网页跳转地址无效。', 422); }
        url = validatePublicURL(next.toString());
        continue;
      }
      if (response.status === 401 || response.status === 403) throw new LinkReaderError('页面需要登录或不允许读取。请直接粘贴你有权使用的相关摘录。', 422);
      if (!response.ok) throw new LinkReaderError('网页暂时无法读取，请检查公开链接或粘贴相关摘录。', 422);
      const type = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
      if (type !== 'text/html' && type !== 'text/plain') {
        void response.body?.cancel().catch(() => {});
        throw new LinkReaderError('仅支持公开 HTML 或纯文本网页；PDF、下载文件和其他格式请先提取文字再粘贴。', 415);
      }
      const source = await readBody(response, MAX_PAGE_BYTES, controller.signal);
      const material = extractReadableText(source, type, url.toString());
      if (material.text.length < 80 || (material.text.length < 1500 && /enable javascript|javascript (?:is )?required|checking your browser|verify you are human|access denied|请先登录|请开启.{0,8}javascript|人机验证/i.test(material.text))) {
        throw new LinkReaderError('页面没有足够的可读取正文，可能需要登录、动态加载或验证。请粘贴相关摘录，当前不会绕过访问限制。', 422);
      }
      return material;
    }
    throw new LinkReaderError('网页跳转次数过多。', 422);
  } catch (error) {
    if (controller.signal.aborted) throw abortError();
    if (error instanceof LinkReaderError) throw error;
    throw new LinkReaderError('网页读取失败，请检查公开链接、稍后重试或粘贴相关摘录。', 502);
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', abort);
  }
}

export async function handleLinkRequest(request: Request, dependencies: { authenticate: () => Promise<boolean>; fetcher?: Fetcher }): Promise<Response> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let removeRequestAbort: (() => void) | undefined;
  try {
    if (!await dependencies.authenticate()) throw new LinkReaderError('请先登录 ChatGPT 后读取网页材料。', 401);
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new LinkReaderError('请使用 JSON 格式提交网页链接。', 415);
    const controller = new AbortController();
    const abort = () => controller.abort();
    request.signal.addEventListener('abort', abort, { once: true });
    removeRequestAbort = () => request.signal.removeEventListener('abort', abort);
    if (request.signal.aborted) controller.abort();
    timer = setTimeout(abort, 8000);
    let body: unknown;
    const raw = await readBody(request, MAX_REQUEST_BYTES, controller.signal);
    try { body = JSON.parse(raw); } catch { throw new LinkReaderError('网页链接请求格式不正确。'); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new LinkReaderError('请提供网页链接。');
    const material = await readPublicLink((body as { url?: unknown }).url, { fetcher: dependencies.fetcher, signal: controller.signal });
    return Response.json(material, { headers: HEADERS });
  } catch (error) {
    const known = error instanceof LinkReaderError ? error : new LinkReaderError('网页读取服务暂时不可用，请稍后重试。', 502);
    return Response.json({ error: known.message }, { status: known.status, headers: HEADERS });
  } finally {
    clearTimeout(timer);
    removeRequestAbort?.();
  }
}
