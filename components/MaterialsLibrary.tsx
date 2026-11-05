"use client";

/* Local IndexedDB data URLs must render directly; no remote image optimizer is involved. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowRight, ArrowUpFromLine, BookOpen, Check, ExternalLink, FileText, FolderOpen, ImagePlus, Link2, Loader2, LockKeyhole, Pencil, Plus, Search, ShieldCheck, Trash2, Upload, X } from "lucide-react";
import { createMaterialsBackup, deleteMaterial, listMaterials, materialError, MATERIAL_BACKUP_LIMIT, MATERIAL_IMAGE_LIMIT, MATERIAL_TEXT_LIMIT, normalizeMaterialUrl, parseMaterialsBackup, saveMaterial, saveMaterials, type Material } from "@/lib/materials";
import "./material-library.css";

type Props = { subjectId: string; onUse: (material: Material) => void; onNotice: (text: string) => void };
type EditorTab = "note" | "link" | "upload";
type Draft = { title: string; content: string; url: string; dataUrl: string; mimeType: string; type: Material["type"] };
const subjectNames: Record<string, string> = { world: "World History", elc: "English Language", physics: "Physics C: E&M", stats: "Statistics", psych: "Psychology", research: "Research",micro:'Microeconomics',macro:'Macroeconomics' };
const typeNames: Record<Material["type"], string> = { note: "自己的笔记", link: "外部链接", image: "作业截图", text: "文本文件" };
const emptyDraft = (type: Material["type"] = "note"): Draft => ({ title: "", content: "", url: "", dataUrl: "", mimeType: "", type });
const fileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("无法读取这张图片，请重新选择。")); reader.readAsDataURL(file); });
const verifyImage = (dataUrl: string): Promise<void> => new Promise((resolve, reject) => { const image = new window.Image(); image.onload = () => image.naturalWidth && image.naturalHeight ? resolve() : reject(new Error("这张图片无法显示，请重新导出为 PNG、JPEG 或 WEBP。")); image.onerror = () => reject(new Error("图片内容无法读取，请选择有效的 PNG、JPEG 或 WEBP。")); image.src = dataUrl; });
const TypeIcon = ({ type, size = 16 }: { type: Material["type"]; size?: number }) => type === "image" ? <ImagePlus size={size} /> : type === "link" ? <Link2 size={size} /> : type === "text" ? <FileText size={size} /> : <BookOpen size={size} />;

export default function MaterialsLibrary({ subjectId, onUse, onNotice }: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [readFailed, setReadFailed] = useState(false);
  const [error, setError] = useState("");
  const [scope, setScope] = useState<"current" | "all">("current");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [tab, setTab] = useState<EditorTab>("note");
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editing, setEditing] = useState<Material | null>(null);
  const [draftSubject, setDraftSubject] = useState(subjectId);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [linkStatus, setLinkStatus] = useState("");
  const [detail, setDetail] = useState<Material | null>(null);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [backup, setBackup] = useState<{ materials: Material[]; duplicates: number } | null>(null);
  const [busyId, setBusyId] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const fileRequest = useRef(0);
  const requestController = useRef<AbortController | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try { const stored = await listMaterials(); setMaterials(stored); setError(""); setReadFailed(false); setLoaded(true); }
    catch (problem) { setError(materialError(problem)); setReadFailed(true); setLoaded(true); }
  }, []);
  useEffect(() => {
    let active = true;
    listMaterials().then((stored) => { if (active) { setMaterials(stored); setLoaded(true); } }).catch((problem) => { if (active) { setError(materialError(problem)); setReadFailed(true); setLoaded(true); } });
    return () => { active = false; requestController.current?.abort(); };
  }, []);
  useEffect(() => {
    if (!detail && !backup) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setDetail(null); setBackup(null); }
      if (event.key === "Tab") {
        const elements = dialogRef.current?.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex="0"]');
        if (!elements?.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [detail, backup]);

  const report = (message: string) => { setError(message); onNotice(message); };
  const updateDraft = (patch: Partial<Draft>) => setDraft((value) => ({ ...value, ...patch }));
  const openEditor = (nextTab: EditorTab, material?: Material) => {
    fileRequest.current += 1; requestController.current?.abort(); setFetching(false); setLinkStatus(""); setTab(nextTab); setEditing(material || null); setDraftSubject(material?.subjectId || subjectId);
    setDraft(material ? { title: material.title, content: material.content, url: material.url || "", dataUrl: material.dataUrl || "", mimeType: material.mimeType || "", type: material.type } : emptyDraft(nextTab === "link" ? "link" : "note"));
    setEditorOpen(true); setError(""); setTimeout(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 30);
  };
  const closeEditor = () => { fileRequest.current += 1; requestController.current?.abort(); setFetching(false); setEditorOpen(false); setEditing(null); setLinkStatus(""); };

  const extractLink = async () => {
    let url: string;
    try { url = normalizeMaterialUrl(draft.url); } catch (problem) { report(materialError(problem)); return; }
    requestController.current?.abort();
    const controller = new AbortController(); requestController.current = controller;
    setFetching(true); setLinkStatus(""); setError("");
    try {
      const result = await fetch("/api/materials/link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }), signal: controller.signal });
      const payload = await result.json() as { title?: string; text?: string; url?: string; error?: string };
      if (controller.signal.aborted) return;
      if (!result.ok || !payload.text?.trim()) throw new Error(payload.error || "网页正文暂时无法读取。可能需要登录、禁止抓取或只包含动态内容。");
      setDraft((previous) => ({ ...previous, title: previous.title || (payload.title || "网页资料").slice(0, 200), url, content: payload.text!.slice(0, 100000) }));
      setLinkStatus("已读取网页正文。请核对内容后保存；你可以自由删改摘录。");
    } catch (problem) {
      if (controller.signal.aborted) return;
      setLinkStatus(`读取失败：${materialError(problem)} 你可以将网页原文复制到下方摘录框，或先只保存链接。`);
    } finally { if (!controller.signal.aborted) setFetching(false); }
  };

  const chooseFile = async (file?: File) => {
    if (!file) return;
    const fileId = ++fileRequest.current;
    setError("");
    try {
      if (["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        if (file.size > MATERIAL_IMAGE_LIMIT) throw new Error("这张截图超过 3 MB；请先压缩或裁剪后再添加。");
        const dataUrl = await fileAsDataUrl(file);
        await verifyImage(dataUrl);
        if (fileId !== fileRequest.current) return;
        updateDraft({ title: file.name.replace(/\.[^.]+$/, "").slice(0, 200), type: "image", dataUrl, mimeType: file.type, content: "" });
      } else if (/\.(txt|md|csv)$/i.test(file.name)) {
        if (file.size > MATERIAL_TEXT_LIMIT) throw new Error("文本文件目前支持最多 6 KB；更长内容可分段添加为笔记。");
        const content = await file.text();
        if (fileId !== fileRequest.current) return;
        if (!content.trim()) throw new Error("这个文本文件是空的。");
        updateDraft({ title: file.name.slice(0, 200), content, type: "text", dataUrl: "", mimeType: "text/plain" });
      } else throw new Error("请选择 PNG、JPEG、WEBP 截图，或 TXT、MD、CSV 文本文件。");
    } catch (problem) { if (fileId === fileRequest.current) report(materialError(problem)); }
  };

  const persistDraft = async () => {
    if (saving) return;
    const title = draft.title.trim();
    if (!title) { report("先给这条资料起一个标题。"); return; }
    if ((draft.type === "note" || draft.type === "text") && !draft.content.trim()) { report("请写入笔记内容或选择一个文本文件。"); return; }
    if (tab === "upload" && !["image", "text"].includes(draft.type)) { report("请先选择要保存的截图或文本文件。"); return; }
    const material: Material = { id: editing?.id || crypto.randomUUID(), title, type: draft.type, subjectId: draftSubject, content: draft.content, createdAt: editing?.createdAt || Date.now() };
    try {
      if (draft.type === "link") material.url = normalizeMaterialUrl(draft.url);
      if (draft.type === "image") { if (!draft.dataUrl) throw new Error("请先选择截图。"); material.dataUrl = draft.dataUrl; material.mimeType = draft.mimeType; }
      if (draft.type === "text") material.mimeType = "text/plain";
      setSaving(true); await saveMaterial(material); await refresh(); closeEditor(); onNotice(editing ? "资料已更新并保存到本机。" : "资料已保存到本机。选择「交给教练」后可附加到对话。");
    } catch (problem) { report(materialError(problem)); } finally { setSaving(false); }
  };

  const remove = async (material: Material) => {
    setBusyId(material.id);
    try { await deleteMaterial(material.id); await refresh(); setConfirmDelete(""); if (detail?.id === material.id) setDetail(null); onNotice("资料已从本机资料库删除。"); }
    catch (problem) { report(materialError(problem)); } finally { setBusyId(""); }
  };
  const exportBackup = () => {
    try {
      const blob = new Blob([createMaterialsBackup(materials)], { type: "application/json" });
      const url = URL.createObjectURL(blob), anchor = document.createElement("a"); anchor.href = url; anchor.download = `ap-materials-${new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" })}.json`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); onNotice("资料库备份已生成，包含笔记、链接和截图。请保存在安全位置。");
    } catch (problem) { report(materialError(problem)); }
  };
  const prepareImport = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > MATERIAL_BACKUP_LIMIT) throw new Error("资料库备份不能超过 20 MB。");
      const incoming = parseMaterialsBackup(await file.text());
      if (!incoming.length) throw new Error("这个备份中没有资料。");
      const currentIds = new Set(materials.map((item) => item.id));
      setBackup({ materials: incoming, duplicates: incoming.filter((item) => currentIds.has(item.id)).length });
    } catch (problem) { report(materialError(problem)); }
  };
  const confirmImport = async () => {
    if (!backup || saving) return;
    setSaving(true);
    try { await saveMaterials(backup.materials); await refresh(); setBackup(null); onNotice(`已导入 ${backup.materials.length} 条资料，已按 ID 合并到本机资料库。`); }
    catch (problem) { report(materialError(problem)); } finally { setSaving(false); }
  };
  const filtered = materials.filter((item) => (scope === "all" || item.subjectId === subjectId) && `${item.title} ${item.content} ${item.url || ""} ${subjectNames[item.subjectId]}`.toLowerCase().includes(search.toLowerCase().trim()));
  const currentCount = materials.filter((item) => item.subjectId === subjectId).length;
  const attachMaterial = (material: Material) => { onUse(material); setDetail(null); };

  return <section className="materials-library">
    <div className="ml-heading"><div><span className="ml-eyebrow"><FolderOpen size={13} /> YOUR SOURCE LIBRARY</span><h2>把你的材料，变成复习的起点</h2><p>笔记、课程链接、作业截图，都可以带进与教练的对话。</p></div><button className="ml-primary" onClick={() => openEditor("note")}><Plus size={16} />添加资料</button></div>
    <div className="ml-local-banner"><LockKeyhole size={15} /><p><strong>保存在此浏览器的本机资料库</strong><span>截图使用 IndexedDB 保存。资料不会自动传给 AI；选取后需你发送。网页读取会向对应网址发起请求。</span></p><span className="ml-local-count">{materials.length} 条资料</span></div>
    {error && <div className="ml-error" role="alert"><p>{error}</p><button onClick={() => setError("")} aria-label="关闭错误提示"><X size={14} /></button></div>}

    {editorOpen && <div className="ml-editor" ref={editorRef}><div className="ml-editor-top"><strong>{editing ? "编辑资料" : "添加到资料库"}</strong><button onClick={closeEditor} aria-label="关闭资料编辑器" disabled={saving}><X size={17} /></button></div><div className="ml-editor-tabs" role="tablist" aria-label="资料类型">{([{ id: "note", text: "写笔记", icon: <Pencil size={14} /> }, { id: "link", text: "外部链接", icon: <Link2 size={14} /> }, { id: "upload", text: "上传文件", icon: <Upload size={14} /> }] as const).map((item) => <button role="tab" aria-selected={tab === item.id} className={tab === item.id ? "is-active" : ""} key={item.id} onClick={() => openEditor(item.id)} disabled={saving}>{item.icon}{item.text}</button>)}</div><div className="ml-editor-body"><div className="ml-editor-row"><label>标题<input value={draft.title} onChange={(event) => updateDraft({ title: event.target.value })} maxLength={200} placeholder="例如：电容器 FRQ 错题 / Research proposal" /></label><label className="ml-subject-select">学科<select value={draftSubject} onChange={(event) => setDraftSubject(event.target.value)}>{Object.entries(subjectNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label></div>
      {tab === "link" && <><label className="ml-label">外部 HTTPS 链接<div className="ml-url-field"><Link2 size={15} /><input type="url" value={draft.url} maxLength={8000} onChange={(event) => { requestController.current?.abort(); setFetching(false); updateDraft({ url: event.target.value }); setLinkStatus(""); }} placeholder="https://…" /><button className="ml-secondary" onClick={() => void extractLink()} disabled={fetching || !draft.url.trim()}>{fetching ? <Loader2 size={13} className="ml-spin" /> : <ArrowDownToLine size={13} />}{fetching ? "读取中" : "读取正文"}</button></div></label>{linkStatus && <p className="ml-link-status" role="status">{linkStatus}</p>}<p className="ml-help">链接本身不是正文。读取成功或粘贴摘录后，教练才能根据具体内容分析；你也可以只收藏链接。</p></>}
      {tab === "upload" && <><input type="file" accept="image/png,image/jpeg,image/webp,.txt,.md,.csv" ref={fileInput} className="ml-file-input" onChange={(event) => { void chooseFile(event.target.files?.[0]); event.target.value = ""; }} /><button className={`ml-upload-zone ${draft.dataUrl || draft.type === "text" ? "has-file" : ""}`} onClick={() => fileInput.current?.click()}><Upload size={21} /><strong>{draft.dataUrl ? "已选择截图 · 点击更换" : draft.type === "text" ? "已读取文本 · 点击更换" : "选择作业截图或文本文件"}</strong><span>PNG / JPEG / WEBP ≤ 3 MB · TXT / MD / CSV ≤ 6 KB</span></button>{draft.dataUrl && <div className="ml-draft-image"><img src={draft.dataUrl} alt={draft.title || "待保存的作业截图"} /></div>}</>}
      <label className="ml-label">{draft.type === "image" ? "截图说明 / 题目背景（可选）" : tab === "link" ? "网页摘录 / 手动粘贴原文（可选）" : "内容"}<textarea value={draft.content} rows={draft.type === "image" ? 3 : 7} maxLength={100000} onChange={(event) => updateDraft({ content: event.target.value })} placeholder={draft.type === "image" ? "例如：这是我第 3 题的解答，请帮我检查符号与推理。" : tab === "link" ? "可粘贴你有权使用的原文摘录；保留来源便于核查。" : "写下课堂笔记、题干、自己的推理或尚未理解的问题…"} /></label><div className="ml-editor-footer"><span><ShieldCheck size={12} />保存只写入本机，不会自动发送</span><div><button className="ml-plain" onClick={closeEditor} disabled={saving}>取消</button><button className="ml-primary" onClick={() => void persistDraft()} disabled={saving || fetching}>{saving ? <Loader2 size={14} className="ml-spin" /> : <Check size={14} />}{saving ? "保存中" : editing ? "保存修改" : "保存资料"}</button></div></div></div></div>}

    <div className="ml-toolbar"><div className="ml-filter" role="group" aria-label="资料学科范围"><button className={scope === "current" ? "is-active" : ""} aria-pressed={scope === "current"} onClick={() => setScope("current")}>当前学科 <span>{currentCount}</span></button><button className={scope === "all" ? "is-active" : ""} aria-pressed={scope === "all"} onClick={() => setScope("all")}>全部资料 <span>{materials.length}</span></button></div><label className="ml-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索标题、笔记、来源…" aria-label="搜索资料" /></label></div>
    {!loaded ? <div className="ml-empty"><Loader2 size={25} className="ml-spin" /><h3>正在打开本机资料库…</h3></div> : readFailed && !materials.length && !editorOpen ? <div className="ml-empty"><FolderOpen size={30} /><h3>资料库暂时无法读取</h3><p>请检查浏览器是否允许本地存储，然后重试。</p><button className="ml-secondary" onClick={() => void refresh()}>重新读取</button></div> : !filtered.length ? <div className="ml-empty"><div className="ml-empty-icon">{search ? <Search size={29} /> : <FolderOpen size={29} />}</div><h3>{search ? "没有找到匹配的资料" : scope === "current" ? `${subjectNames[subjectId] || "当前学科"} 的资料库还是空的` : "从第一条自己的材料开始"}</h3><p>{search ? "换个关键词，或切换到全部学科看看。" : "添加一条课堂笔记、课程链接或作业截图。你的材料会保存在这台设备的浏览器中。"}</p>{!search && <div><button className="ml-primary" onClick={() => openEditor("note")}><Plus size={14} />写第一条笔记</button><button className="ml-secondary" onClick={() => openEditor("upload")}><ImagePlus size={14} />添加作业截图</button></div>}</div> : <div className="ml-grid">{filtered.map((material) => <article key={material.id} className="ml-card"><div className={`ml-card-visual ${material.type}`}><button onClick={() => setDetail(material)} aria-label={`查看 ${material.title}`}>{material.type === "image" && material.dataUrl ? <img src={material.dataUrl} alt={material.title} loading="lazy" /> : material.type === "link" ? <div className="ml-link-preview"><Link2 size={26} /><span>{material.url ? new URL(material.url).hostname : "外部来源"}</span></div> : <div className="ml-text-preview"><TypeIcon type={material.type} size={20} /><p>{material.content}</p></div>}</button><span className="ml-type-pill"><TypeIcon type={material.type} size={10} />{typeNames[material.type]}</span></div><div className="ml-card-body"><div className="ml-card-meta"><span>{subjectNames[material.subjectId]}</span><time dateTime={new Date(material.createdAt).toISOString()}>{new Date(material.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric", timeZone: "Asia/Shanghai" })}</time></div><button className="ml-card-title" onClick={() => setDetail(material)}>{material.title}</button><p>{material.type === "image" ? material.content || "原图已保存在本机；发送到教练后可分析题目与作答。" : material.content || "仅收藏了链接，尚未保存正文。可以编辑并粘贴摘录。"}</p><div className="ml-card-actions"><button className="ml-use" onClick={() => attachMaterial(material)}>交给教练 <ArrowRight size={13} /></button><div>{material.type === "link" && material.url && <a href={material.url} target="_blank" rel="noreferrer" aria-label={`打开来源 ${material.title}`} title="打开原始链接"><ExternalLink size={13} /></a>}<button onClick={() => openEditor(material.type === "note" ? "note" : material.type === "link" ? "link" : "upload", material)} aria-label={`编辑 ${material.title}`} title="编辑资料"><Pencil size={13} /></button><button onClick={() => setConfirmDelete(confirmDelete === material.id ? "" : material.id)} aria-label={`删除 ${material.title}`} title="删除资料"><Trash2 size={13} /></button></div></div>{confirmDelete === material.id && <div className="ml-delete-confirm"><span>从本机资料库删除？</span><button className="ml-delete-yes" disabled={busyId === material.id} onClick={() => void remove(material)}>{busyId === material.id ? "删除中…" : "确认删除"}</button><button onClick={() => setConfirmDelete("")}>取消</button></div>}</div></article>)}</div>}
    <div className="ml-backup-bar"><div><ArrowDownToLine size={16} /><p><strong>资料库专用备份</strong><span>包含全部学科的原文与截图，与学习进度备份分开。清除浏览器数据前请先导出。</span></p></div><div><button className="ml-secondary" onClick={exportBackup} disabled={!loaded || !materials.length}><ArrowDownToLine size={13} />导出资料</button><button className="ml-secondary" onClick={() => importInput.current?.click()} disabled={saving}><ArrowUpFromLine size={13} />导入备份</button><input className="ml-file-input" type="file" accept="application/json,.json" ref={importInput} onChange={(event) => { void prepareImport(event.target.files?.[0]); event.target.value = ""; }} /></div></div>

    {(detail || backup) && <div className="ml-modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget && !saving) { setDetail(null); setBackup(null); } }}><div className="ml-dialog" role="dialog" aria-modal="true" aria-labelledby="ml-dialog-title" tabIndex={-1} ref={dialogRef}><div className="ml-dialog-head"><div><span>{detail ? `${typeNames[detail.type]} · ${subjectNames[detail.subjectId]}` : "资料库专用备份"}</span><h3 id="ml-dialog-title">{detail?.title || "确认合并导入"}</h3></div><button aria-label="关闭预览" onClick={() => { setDetail(null); setBackup(null); }} disabled={saving}><X size={18} /></button></div>{detail ? <><div className="ml-dialog-body">{detail.type === "image" && detail.dataUrl && <img className="ml-detail-image" src={detail.dataUrl} alt={detail.title} />}{detail.url && <a className="ml-detail-link" href={detail.url} target="_blank" rel="noreferrer"><ExternalLink size={14} />{detail.url}</a>}{detail.content ? <div className="ml-detail-text">{detail.content}</div> : <p className="ml-help">{detail.type === "link" ? "只保存了链接，还没有网页正文。你可以编辑资料并读取或粘贴摘录。" : "未添加文字说明。"}</p>}</div><div className="ml-dialog-footer"><span>选择后附加到对话，发送时才提交给 AI。</span><button className="ml-primary" onClick={() => attachMaterial(detail)}>交给教练 <ArrowRight size={14} /></button></div></> : backup && <><div className="ml-dialog-body"><div className="ml-import-summary"><FolderOpen size={28} /><strong>{backup.materials.length} 条资料</strong><span>{backup.materials.filter((item) => item.type === "image").length} 张截图 · {new Set(backup.materials.map((item) => item.subjectId)).size} 个学科</span></div><p className="ml-import-note">将资料合并到本机，不删除现有的其他资料。{backup.duplicates ? `其中 ${backup.duplicates} 条具有相同 ID，将用备份中的版本替换。` : "没有与当前资料库重复的 ID。"}</p><p className="ml-help">只导入你信任的备份。资料导入后仍只保存在本机。</p></div><div className="ml-dialog-footer"><button className="ml-plain" onClick={() => setBackup(null)} disabled={saving}>取消</button><button className="ml-primary" onClick={() => void confirmImport()} disabled={saving}>{saving ? <Loader2 className="ml-spin" size={14} /> : <ArrowUpFromLine size={14} />}{saving ? "导入中…" : "确认合并导入"}</button></div></>}</div></div>}
  </section>;
}
