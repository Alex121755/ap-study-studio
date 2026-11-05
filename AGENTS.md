# AP Atlas 的运行边界

用户明确要求本地应用。仅在本机 127.0.0.1 运行；无需 ChatGPT 登录。
用户已明确要求准备公开 GitHub 源码仓库，并让使用者填写自己的 API key。可以准备独立源码仓库；实际上传前须重新通过 GitHub Project Uploader 预检，再取得与该版本、完整目标仓库及公开可见性对应的确认。GitHub 源码上传不等于网站部署，不得部署到云端，除非用户明确改变这一要求。
密钥仅保存在未跟踪的 .env.local 中（0600 权限），不得读取到输出、前端包或源码仓库。
保留设置界面的个人 API key 输入与保存功能；本机服务保存后即时生效，无需重新启动。不得回传已保存的完整密钥、写入浏览器备份或内置作者的共享密钥。
提交的配置模板仅限 config/environment.template，密钥和代理值保持空白。不得复制原项目的 Git 历史、密钥、本机资料备份或依赖缓存。
公开源码的启动与配置须可移植，不得依赖作者的个人绝对路径。
保留实时模型选择、个人资料库、八科知识图与交互实验室。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
