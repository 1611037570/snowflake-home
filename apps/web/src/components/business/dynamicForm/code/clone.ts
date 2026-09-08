import { toRaw } from "vue";

// 深拷贝并保留函数引用：供 addConfig 等 schema 克隆使用，函数型默认值需要保留
export function cloneWithFunctions(value: any): any {
  const raw = toRaw(value);
  if (typeof raw === "function") return raw;
  if (Array.isArray(raw)) return raw.map(cloneWithFunctions);
  if (raw && typeof raw === "object") {
    const result: Record<string, any> = {};
    Object.entries(raw).forEach(([key, item]) => {
      result[key] = cloneWithFunctions(item);
    });
    return result;
  }
  return raw;
}
