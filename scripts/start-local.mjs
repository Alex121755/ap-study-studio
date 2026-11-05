import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(projectRoot);
const envFile = path.join(projectRoot, ".env.local");
if (existsSync(envFile) && typeof process.loadEnvFile === "function") process.loadEnvFile(envFile);

const rawPort = process.env.AP_ATLAS_PORT || process.env.PORT || "5173";
const port = Number(rawPort);
if (!/^\d+$/.test(rawPort) || !Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("AP_ATLAS_PORT 必须为 1–65535 的端口号。");
}

const env = { ...process.env, AP_ATLAS_PORT: String(port), PORT: String(port), NODE_USE_ENV_PROXY: "1", NEXT_TELEMETRY_DISABLED: "1" };
env.PATH = `${path.dirname(process.execPath)}${path.delimiter}${env.PATH || ""}`;
// Proxying is opt-in through the environment; no machine-specific proxy is assumed.
if (env.AP_ATLAS_PROXY_URL) {
  env.HTTPS_PROXY = env.AP_ATLAS_PROXY_URL;
  env.HTTP_PROXY = env.AP_ATLAS_PROXY_URL;
}
env.NO_PROXY = [...new Set([...(env.NO_PROXY || "").split(",").filter(Boolean), "localhost", "127.0.0.1", "::1"])].join(",");

const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
if (!existsSync(nextBin)) throw new Error("缺少本地依赖，请先在项目目录运行 npm install。");
const localUrl = `http://127.0.0.1:${port}`;
function openBrowser() {
  if (process.env.AP_ATLAS_OPEN_BROWSER === "1" && process.platform === "darwin") {
    const browser = spawn("/usr/bin/open", [localUrl], { stdio: "ignore", detached: true });
    browser.unref();
  }
}
try {
  const existing = await fetch(`${localUrl}/api/status`, { signal: AbortSignal.timeout(800) });
  const status = await existing.json();
  if (existing.ok && typeof status.configured === "boolean" && status.defaultModel) {
    console.log(`AP Atlas 已在本机运行：${localUrl}`);
    openBrowser();
    process.exit(0);
  }
} catch { /* Start the local service when it is not already running. */ }
console.log(`AP Atlas 本地服务：${localUrl}`);
const child = spawn(process.execPath, [nextBin, "dev", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: projectRoot, env, stdio: "inherit",
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("error", (error) => { console.error(`本地服务未能启动：${error.message}`); process.exitCode = 1; });
child.on("exit", (code, signal) => { if (signal) process.exitCode = 0; else process.exitCode = code ?? 1; });

if (process.env.AP_ATLAS_OPEN_BROWSER === "1") {
  let attempts = 0;
  const ready = setInterval(async () => {
    if (++attempts > 60 || child.exitCode !== null) { clearInterval(ready); return; }
    try {
      const response = await fetch(`${localUrl}/api/status`, { signal: AbortSignal.timeout(500) });
      if (response.ok) { clearInterval(ready); openBrowser(); }
    } catch { /* Wait for Next to begin listening. */ }
  }, 500);
}
