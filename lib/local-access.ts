/** Local API access is independent of ChatGPT and fails closed on remote hosts. */
export function isLocalRequest(request: Request): boolean {
  const configuredPort = process.env.AP_ATLAS_PORT || process.env.PORT || "5173";
  if (!/^\d+$/.test(configuredPort)) return false;
  const port = Number(configuredPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return false;
  const allowedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`, `[::1]:${port}`]);
  const host = request.headers.get("host")?.toLowerCase();
  if (!host || !allowedHosts.has(host)) return false;
  let url: URL;
  try { url = new URL(request.url); } catch { return false; }
  // Next can normalize request.url to localhost even when the browser used 127.0.0.1.
  // Both the unmodified Host header and the normalized URL must independently be local.
  if (url.protocol !== "http:" || url.username || url.password || !allowedHosts.has(url.host.toLowerCase())) return false;
  // An Origin supplied by a foreign page must never gain access to the local key.
  const origin = request.headers.get("origin");
  if (origin !== null && origin !== `http://${host}`) return false;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;
  return true;
}

export function localAccessDenied(): Response {
  return Response.json(
    { error: "此服务只接受从本机 AP Atlas 页面发起的请求。请打开 http://127.0.0.1:5173。" },
    { status: 403, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } },
  );
}

/** Preserve the browser's validated local origin for downstream same-origin checks. */
export function normalizeLocalRequest(request: Request): Request {
  if (!isLocalRequest(request)) throw new Error("Local request required");
  const url = new URL(request.url);
  url.host = request.headers.get("host")!;
  return new Request(url, request);
}
