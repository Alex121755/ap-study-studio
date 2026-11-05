#!/bin/zsh
cd -- "${0:A:h}"
AP_ATLAS_NODE="$(command -v node 2>/dev/null)"
if [[ -z "$AP_ATLAS_NODE" || ! -x "$AP_ATLAS_NODE" ]]; then
  print '没有找到 Node.js，请安装 Node.js 24.19 或更新版本，并确保 node 在 PATH 中。'
  read '?按回车关闭'
  exit 1
fi
if ! "$AP_ATLAS_NODE" -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major > 24 || (major === 24 && minor >= 19) ? 0 : 1)'; then
  print '需要 Node.js 24.19 或更新版本，请升级 Node.js 后重新启动。'
  read '?按回车关闭'
  exit 1
fi
export AP_ATLAS_OPEN_BROWSER=1
exec "$AP_ATLAS_NODE" scripts/start-local.mjs
