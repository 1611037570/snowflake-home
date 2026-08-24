import { toRaw } from "vue";

/**
 * 创建统一的"新增子项"方法（引擎容器内部使用）
 * 基于当前容器配置定位新增目标：
 * - array 容器：直接新增到自身 list
 * - object/container 容器：对第一个 array 子字段新增
 * 深拷贝 addConfig 后 push，避免多个子项共享同一份引用。
 * @param currentForm 当前容器配置（ref 或普通对象）
 */
export function createAddItem(currentForm: any) {
  return () => {
    const form = currentForm?.value ?? currentForm;
    if (!form) return;
    const arrayField =
      form.type === "array" ? form : form.fields?.find((f: any) => f.type === "array");
    if (!arrayField?.addConfig) return;
    arrayField.list.push(structuredClone(toRaw(arrayField.addConfig)));
  };
}
