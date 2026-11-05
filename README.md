# AP Atlas · 本地 AP 复习助理

一个在你的电脑上运行的中文 AP 学习助理，保留英文术语，支持可选模型的流式 AI 对话、知识关系图、交互实验、练习、个人资料库、笔记与 Research 项目审查。

应用和 API 服务都在 `127.0.0.1` 本机运行，无需注册或登录。学习记录、个人笔记、链接和截图保存在本机浏览器。AI 计算使用你的 OpenAI API key 调用 OpenAI，需要网络和 API 额度；这里的“本地”指应用与资料存储在本机。

这是面向公开 GitHub 仓库的独立源码版，保留完整学习功能，未包含原工作目录的 Git 历史、本机密钥、个人学习数据或依赖缓存。每位使用者填写自己的 API key；仓库不提供作者的共享密钥，也不依赖作者的个人目录路径。上传 GitHub 仅用于保存和分享源码；应用仍在本机运行。

## 阅读具体知识点

图谱中的每个节点都可以点击，打开完整知识卡；课程路径中的每一条也可直接展开具体子知识点，再进入完整讲解。109 张内置知识卡覆盖八科，每张包含学习目标、4 个具体要点、概念解释、原创解析例题、易错辨析、2 道带参考答案的自测与关联跳转。公式由 KaTeX 显示。

知识卡保存在本机源码中，阅读无需调用 AI。可以把知识卡摘录存入该知识点的笔记，也可准备一条让教练追问的问题；教练会收到当前卡片作为辅导背景。搜索框也会检索子知识点，例如 `exigence`、`IQR`、`时间常数`。

## 启动与配置

需要 Node.js **24.19.0 或更新版本**以及 npm；此版本已验证本项目的环境代理功能。在项目目录安装并启动：

```sh
npm ci
npm run dev
```

打开工作台的“设置与学习数据”，在 API key 配置区填写**自己的 OpenAI API key**并保存。本机服务将密钥写入被 Git 忽略的 `.env.local`，文件权限设为 `600`，保存后立即用于后续请求，无需重新启动。页面不会从服务端读回已保存的完整密钥。

也可选择手动配置，或设置本机 HTTP 代理与端口：

```sh
[ -f .env.local ] || cp config/environment.template .env.local
chmod 600 .env.local
```

用文本编辑器打开 `.env.local`，填写 `OPENAI_API_KEY`；需要代理时填写 `AP_ATLAS_PROXY_URL`，不需要时保持空白。模板不含可用凭据，`AP_ATLAS_PORT` 默认为 `5173`。手动编辑该文件后重新启动应用；设置界面保存密钥则即时生效。

macOS 完成首次安装后，也可双击 **`启动 AP Atlas.command`** 自动打开工作台；启动器使用 PATH 中的 Node.js。

使用终端显示的 `http://127.0.0.1:端口/` 地址；使用同一浏览器和地址可继续读取已保存的资料。`localhost` 与 `127.0.0.1`、不同端口各自有独立浏览器存储，建议始终打开同一地址。

## 包含什么

- **八门学科**：AP World History: Modern、AP English Language and Composition（ELC）、AP Physics C: Electricity and Magnetism、AP Statistics、AP Psychology、AP Research、AP Microeconomics、AP Macroeconomics。
- **知识地图**：109 个精选节点，包含经济学与历史、统计、心理及 Research 的有向关联。可按学科探索、点击节点、查看关系、缩放和平移；跨学科图展示相邻概念的一个子集。
- **实时 AI 教练**：理解概念、出题训练、审查作答、建立关联；支持选择模型、流式输出和停止生成。关联模式可将 AI 给出的结构化关系显示为图谱。
- **个人资料库**：按学科保存课堂笔记、网页链接与摘录、文本文件和作业截图，支持搜索、查看、编辑以及加入教练附件。公开网页可显式读取正文；截图可交给支持图像输入的模型分析。
- **交互实验**：通过学科对应的模型探索电容、置信区间、历史联系、英文论证、记忆、研究设计、微观供需与税负、宏观 AD–SRAS 与产出缺口。各模型在页面中说明其教学假设。
- **练习**：内置 8 道原创热身题，每科 1 道；AI 可继续生成针对性原创练习，数量取决于 API 额度、服务限制及项目权限。原创练习不属于 College Board 官方题库。
- **研究工作台**：保存研究问题、阶段、方法、总体与样本，审查问题—方法—证据—结论的对齐，逐题模拟口头答辩。
- **学习记录**：按知识点记笔记、自评并建立到期复习列表；设置个人考试或检查点日期。

## 经济学复习

新增 **AP Microeconomics（微观）** 与 **AP Macroeconomics（宏观）**，各按当前官方六单元组织 16 个精选节点，共 32 张知识卡、32 个原创解析例题和 64 道带答案自测。每张卡都能直接打开阅读，并支持搜索、笔记、自评、关联跳转和 AI 追问；经济学材料也可按学科保存及导入导出。

微观覆盖机会成本、比较优势、边际效用、供需与弹性、政策福利、成本与竞争、垄断与博弈、要素市场和市场失灵。宏观覆盖 GDP、通胀、失业、AD–AS、财政与货币政策、金融市场、增长与债务、汇率和国际收支。目录是复习精选地图，不能代替完整 CED。

微观实验可调整需求、供给与单位税，实时查看价格、交易量、税负、税收和无谓损失；宏观实验可调整 AD 与 SRAS，观察短期均衡及相对潜在产出的缺口。两者都标注坐标轴、方程和适用假设，可将当前参数交给教练练习 FRQ。图形中的示例数值不是真实经济预测。

## 开始使用

先选学科和知识点。需要解释时选择“理解概念”；需要检验理解时选择“出题训练”，作答后再查看反馈。知识图可以帮助发现前置概念及跨学科联系。

教练上方和“设置与学习数据”中都可以选择模型。模型列表由服务端使用当前配置的 OpenAI 项目凭据读取，筛选适合此对话功能的模型，并将新版本排在前面。点击刷新会重新请求模型列表；暂时失败时会显示原因，保留上次成功同步的列表和你的选择。浏览器也会保存成功同步的列表，重新打开时可继续使用。首次尚未成功同步且没有缓存时，提供 `gpt-4.1-mini`、`gpt-4.1`、`gpt-5-mini` 三个备用选项。列表与缓存不保证当前项目拥有模型权限；实际可调用性、图像支持和费用取决于模型及项目权限。

“设置与学习数据”中也可测试一次简短 AI 请求，以及导出或导入学习记录。连接测试和 AI 对话会使用 OpenAI API 额度。

## 使用自己的材料

在“个人资料库”添加资料并按学科归档。可以直接写笔记、收藏 HTTPS 链接并粘贴摘录，也可以上传 **TXT、Markdown（MD）、CSV 文本文件，单个不超过 6 KB**，或 **PNG、JPEG、WEBP 作业截图，单张不超过 3 MB**。截图以图像形式发送给模型，不是先在本机完成 OCR；识别结果需要结合原图核对。当前没有 PDF、Word 或扫描 PDF 解析器，这类文件可先提取相关文字，或把相关页面截成受支持的图片。

网页资料中的“读取正文”会向服务端提交你指定的链接，由服务端请求公开 HTTPS 页面。仅支持 HTML 或纯文本，读取上限为 512 KB、约 8 秒，最多跟随 3 次跳转，提取正文最多 16,000 字符。内部网络、IP 地址和非标准端口被拒绝；需要登录、动态加载、人机验证、受限访问或 PDF 下载的内容可能无法读取。此时可直接粘贴你有权使用的相关摘录。保存链接本身并不意味着教练已经读过网页。

点击资料卡片的“交给教练”将它加入待发送附件，再输入当前问题并发送。每次最多选择 **5 份资料**，其中最多 **3 张截图**，截图合计不超过 **8 MB**；选中文本资料的正文合计不超过 **20,000 字符**。在此限制内，所选正文会与本次问题一起完整发送，不只发送标题或链接；超出时需缩短内容或减少选择。单条问题上限为 6,000 字符。资料保存在库中时不会自动提交给 AI。

## 数据与密钥

对话、知识点笔记、自评、练习次数、个人日期和研究设定保存在**当前浏览器的 localStorage**。个人资料库另存于同一浏览器的 **IndexedDB**，包括截图。两者都只保存在本机，当前没有跨设备同步；更换设备、浏览器或清理网站数据前请分别备份。

- **学习记录备份**：在“设置与学习数据”导出 JSON，包含对话、知识点笔记、自评与项目设定，**不包含个人资料库**。导入会替换当前浏览器的这部分学习记录，建议先导出当前记录。
- **资料库专用备份**：在“个人资料库”导出独立 JSON，包含库内笔记、链接、摘录及截图。导入时按资料 ID 合并，重复 ID 的内容会被导入版本替换；界面会先显示待导入数量。资料库备份上限为 20 MB。

手动把这两种备份带到新设备并分别导入，可以迁移学习记录与资料；它们不是同一种备份格式。包含截图和个人材料的备份请保存在合适的位置。

发送问题时，当前问题、选定知识点、有关的对话上下文，以及你明确选中的材料、截图或相关项目设定会经本机服务传给 OpenAI。点击“读取正文”会由本机服务对你指定的网页及固定 DNS 解析服务发起请求。库中未选中的资料不会自动随对话发送。

每位使用者的密钥由其自行提供，设置界面只向当前电脑上的本机服务提交密钥。本机服务以 `600` 权限保存到被 Git 忽略的 `.env.local`，不会将密钥存入浏览器的学习记录或资料库备份，也不会把已保存的完整密钥返回页面。仓库中的 `config/environment.template` 仅提供空值模板；公开源码不含共享密钥。页面的“本机AI已配置”表示本机服务已读到密钥，实际连接可在“设置与学习数据”测试。应用不需要 ChatGPT 登录。

## 开发与检查

项目使用 React、TypeScript 和 Next.js，本机 Node 服务处理 AI 请求与显式链接读取。主要命令：

```sh
npm run dev
npm test
npm run build
npm start
```

`npm run dev` 和 `npm start` 都通过启动器运行仅监听 `127.0.0.1` 的本机开发服务。`npm run build` 用于检查生产构建；当前启动器不会自动切换到生产服务器。

主要源码位置：`components/Studio.tsx` 是学习工作台，`components/StudyLab.tsx` 是交互实验，`components/KnowledgeGraph.tsx` 是关系图，`components/MaterialsLibrary.tsx` 与 `lib/materials.ts` 管理本机资料库，`lib/curriculum.ts` 是课程地图，`lib/tutor.ts` 与 `app/api/chat/route.ts` 处理 AI 请求，`app/api/models/route.ts` 读取项目模型列表，`lib/link-reader.ts` 与 `app/api/materials/link/route.ts` 读取指定公开网页。

`components/ApiKeySettings.tsx` 提供设置界面的个人密钥配置，`app/api/settings/credentials/route.ts` 负责本机凭据保存。

## 课程依据与使用边界

课程结构已于 **2026 年 11 月 2 日**对照 College Board 公开页面核查。目录是精选复习地图，仍需结合教师课程、当前 Course and Exam Description（CED）及官方评分指南学习。

- [AP World History: Modern](https://apcentral.collegeboard.org/courses/ap-world-history)：九个内容单元及历史思维技能。
- [AP English Language and Composition](https://apcentral.collegeboard.org/courses/ap-english-language-and-composition)：官方九单元循环发展修辞、证据、推理与风格技能；本项目按四类技能聚合。
- [AP Physics C: Electricity and Magnetism](https://apcentral.collegeboard.org/courses/ap-physics-c-electricity-and-magnetism)：Unit 8–13。官方页面列有适用于 2026–27 学年的澄清及 2027 考试更新。
- [AP Statistics](https://apcentral.collegeboard.org/courses/ap-statistics)与[2026 年秋季起生效的 CED](https://apcentral.collegeboard.org/media/pdf/ap-statistics-course-and-exam-description.pdf)：采用 **2026–27 新五单元结构**，不沿用旧九单元。回归部分聚焦图形、相关、线性模型、残差与最小二乘。
- [AP Psychology](https://apcentral.collegeboard.org/courses/ap-psychology)：当前五单元，贯穿研究方法、数据解释与论证。
- [AP Microeconomics](https://apcentral.collegeboard.org/courses/ap-microeconomics) 与 [AP Macroeconomics](https://apcentral.collegeboard.org/courses/ap-macroeconomics)：经济学内容于 **2026 年 11 月 5 日**对照 Fall 2026 CED 核查，各采用六单元结构；宏观区分有限准备金与充裕准备金的政策传导。
- [AP Research](https://apcentral.collegeboard.org/courses/ap-research)及[评估形式](https://apcentral.collegeboard.org/courses/ap-research/exam)：论文 4,000–5,000 词、占 75%；展示与口头答辩合计约 15–20 分钟、占 25%。
- [2026–27 AP Capstone AI 使用政策](https://apcentral.collegeboard.org/exam-administration-ordering-scores/administering-exams/exam-policies/artificial-intelligence-tools)与[研究伦理及审批政策](https://apcentral.collegeboard.org/courses/resources/ap-capstone-policies)：AI 可辅助探索、初步寻找来源、理解材料与检查语法语气；学生须直接阅读来源并独立完成分析、综合和最终表达，完成 PREP 与教师过程检查点。数据收集前须完成教师审查，额外审批依研究内容与传播计划核对。

AP Research 模式用于提问、审查、准备和反馈。它不会代替教师或 IRB 审批，不提供官方评分，也不代写需要学生独立完成的最终研究成果。提供评分指南和真实材料可以让反馈更有依据。

当前 AI 对话**没有自由联网搜索工具**。你可以在资料库中显式读取一个公开链接、核对提取结果后再交给教练；这不等于模型会自行搜索或实时核实所有事实。最新课程政策、引文、文献缺口或题目来源仍需打开官方来源或提供原文查证；AI 生成的关系与反馈也可能有误。

“掌握程度”来自你的手动自评，复习间隔为约 1 小时、1 天、3 天或 7 天，不是经过验证的自动能力测评。热身正确率只反映内置题的作答记录。页面中的个人倒计时使用你设置的日期，不代表官方考期。
