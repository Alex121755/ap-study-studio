/** Local-only source library. Binary images belong in IndexedDB, never localStorage. */
import {SUBJECT_IDS} from './subject-ids.ts';
export type Material = {
  id: string;
  title: string;
  type: "note" | "link" | "image" | "text";
  subjectId: string;
  content: string;
  url?: string;
  dataUrl?: string;
  mimeType?: string;
  createdAt: number;
};

export const MATERIAL_IMAGE_LIMIT = 3 * 1024 * 1024;
export const MATERIAL_TEXT_LIMIT = 6 * 1024;
export const MATERIAL_BACKUP_LIMIT = 20 * 1024 * 1024;
const SUBJECTS = new Set<string>(SUBJECT_IDS);
const DATABASE = "ap-study-studio-materials";
const STORE = "materials";
let database: Promise<IDBDatabase> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("此浏览器无法使用 IndexedDB；请使用允许本地存储的浏览器窗口。"));
  if (!database) {
    database = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: "id" });
      };
      request.onerror = () => { database = undefined; reject(request.error || new Error("无法打开本地资料库。")); };
      request.onblocked = () => { database = undefined; reject(new Error("资料库被另一个页面占用，请关闭旧页面后重试。")); };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => { db.close(); database = undefined; };
        resolve(db);
      };
    });
  }
  return database;
}

export async function listMaterials(): Promise<Material[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readonly");
    const request = transaction.objectStore(STORE).getAll();
    request.onsuccess = () => resolve((request.result as Material[]).sort((a, b) => b.createdAt - a.createdAt));
    request.onerror = () => reject(request.error || new Error("读取资料失败。"));
  });
}

export async function saveMaterials(materials: Material[]): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    for (const material of materials) transaction.objectStore(STORE).put(material);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("保存失败，可能已达到浏览器存储限额。"));
    transaction.onabort = () => reject(transaction.error || new Error("保存被中止，资料未写入。"));
  });
}

export async function saveMaterial(material: Material): Promise<void> { return saveMaterials([material]); }

export async function deleteMaterial(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("删除失败，请重试。"));
    transaction.onabort = () => reject(transaction.error || new Error("删除操作被中止。"));
  });
}

export function normalizeMaterialUrl(value: string): string {
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new Error("请输入完整的 https:// 外部链接。"); }
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("只支持不含登录凭据的 HTTPS 链接。");
  return url.toString();
}

export function createMaterialsBackup(materials: Material[]): string {
  const serialized = JSON.stringify({ format: "ap-study-materials", version: 1, exportedAt: new Date().toISOString(), materials }, null, 2);
  if (new Blob([serialized]).size > MATERIAL_BACKUP_LIMIT) throw new Error("资料库备份超过 20 MB；请先删除不需要的截图或分开保留原始文件。");
  return serialized;
}

function validString(value: unknown, maxLength: number): value is string { return typeof value === "string" && value.length <= maxLength; }

/** Strict validation keeps imported backups portable and prevents unsafe link / image schemes. */
export function parseMaterialsBackup(serialized: string): Material[] {
  if (new Blob([serialized]).size > MATERIAL_BACKUP_LIMIT) throw new Error("备份文件不能超过 20 MB。");
  let parsed: unknown;
  try { parsed = JSON.parse(serialized); } catch { throw new Error("这个文件不是有效的 JSON 备份。"); }
  if (!parsed || typeof parsed !== "object") throw new Error("无法识别资料库备份格式。");
  const backup = parsed as Record<string, unknown>;
  if (backup.format !== "ap-study-materials" || backup.version !== 1 || !Array.isArray(backup.materials)) throw new Error("请选择「资料库专用备份」导出的 JSON 文件；它与学习进度备份分开保存。");
  if (backup.materials.length > 2000) throw new Error("一个备份最多包含 2000 条资料。");
  const ids = new Set<string>();
  return backup.materials.map((item: unknown, index: number) => {
    if (!item || typeof item !== "object") throw new Error(`第 ${index + 1} 条资料格式不正确。`);
    const entry = item as Record<string, unknown>;
    if (!validString(entry.id, 160) || !entry.id || ids.has(entry.id) || !validString(entry.title, 200) || !entry.title.trim() || !validString(entry.content, 200000) || typeof entry.subjectId !== "string" || !SUBJECTS.has(entry.subjectId) || !["note", "link", "image", "text"].includes(String(entry.type)) || typeof entry.createdAt !== "number" || !Number.isFinite(entry.createdAt) || entry.createdAt < 0 || entry.createdAt > 8640000000000000) throw new Error(`第 ${index + 1} 条资料字段不完整或不受支持。`);
    ids.add(entry.id);
    const material: Material = { id: entry.id, title: entry.title, content: entry.content, subjectId: entry.subjectId, type: entry.type as Material["type"], createdAt: entry.createdAt };
    if (material.type === "link") {
      if (typeof entry.url !== "string" || entry.url.length > 8000) throw new Error(`第 ${index + 1} 条外部链接无效。`);
      material.url = normalizeMaterialUrl(entry.url);
    }
    if (material.type === "image") {
      if (typeof entry.dataUrl !== "string" || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]*={0,2}$/.test(entry.dataUrl)) throw new Error(`第 ${index + 1} 张截图格式无效，只支持 PNG、JPEG、WEBP。`);
      const [header, base64] = entry.dataUrl.split(",");
      const decodedSize = base64.length * 3 / 4 - (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);
      if (!base64.length || base64.length % 4 !== 0) throw new Error(`第 ${index + 1} 张截图编码无效。`);
      if (decodedSize > MATERIAL_IMAGE_LIMIT) throw new Error(`第 ${index + 1} 张截图超过 3 MB。`);
      material.dataUrl = entry.dataUrl;
      material.mimeType = header.slice(5, -7);
    }
    if (material.type === "text") material.mimeType = "text/plain";
    return material;
  });
}

export function materialError(error: unknown): string {
  if (error instanceof DOMException && error.name === "QuotaExceededError") return "本机浏览器存储空间不足，资料没有保存。请导出备份并清理不需要的截图。";
  return error instanceof Error ? error.message : "资料操作失败，请重试。";
}
