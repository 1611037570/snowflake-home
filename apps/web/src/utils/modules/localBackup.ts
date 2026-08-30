import { del, get, set } from "idb-keyval";
import { ref } from "vue";

// 备份目录句柄在 IndexedDB 中的存储键
const BACKUP_HANDLE_KEY = "snowflake-resume-backup-handle";

// 是否已开启本地自动备份（全局共享状态）
export const localBackupEnabled = ref(false);

// 浏览器是否支持文件系统访问接口
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

// 读取持久化的目录句柄
async function getStoredHandle(): Promise<FileSystemDirectoryHandle | undefined> {
  return get(BACKUP_HANDLE_KEY);
}

// 开启本地自动备份：选择备份目录并持久化句柄，返回目录名，取消返回 null
export async function enableLocalBackup(): Promise<string | null> {
  if (!isFileSystemAccessSupported()) return null;
  try {
    const handle = await window.showDirectoryPicker({ mode: "readwrite" });
    await set(BACKUP_HANDLE_KEY, handle);
    localBackupEnabled.value = true;
    return handle.name;
  } catch {
    // 用户取消选择目录或浏览器拒绝授权
    return null;
  }
}

// 关闭本地自动备份：删除持久化的目录句柄
export async function disableLocalBackup(): Promise<void> {
  await del(BACKUP_HANDLE_KEY);
  localBackupEnabled.value = false;
}

// 初始化本地备份状态：返回已绑定的目录名，未绑定返回 null
export async function initLocalBackup(): Promise<string | null> {
  const handle = await getStoredHandle();
  localBackupEnabled.value = !!handle;
  return handle?.name ?? null;
}

// 将备份内容写入本地目录文件，无句柄或写入失败返回 false
export async function writeLocalBackup(filename: string, content: string): Promise<boolean> {
  const handle = await getStoredHandle();
  if (!handle) return false;
  try {
    const fileHandle = await handle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
    return true;
  } catch {
    console.warn(`本地备份写入失败：${filename}`);
    return false;
  }
}
