import { addArrayRecord } from "./arrayData";

/**
 * 创建统一的"新增子项"方法（引擎容器内部使用）
 * 基于当前容器配置定位新增目标：
 * - array 容器：直接向自身数据数组新增
 * - object/container 容器：对第一个 array 子字段新增
 * @param currentForm 当前容器配置（ref 或普通对象）
 * @param rootData 根数据代理
 */
export function createAddItem(currentForm: any, rootData: any) {
  return () => {
    const form = currentForm?.value ?? currentForm;
    if (!form) return;
    const arrayField =
      form.type === "array" ? form : form.fields?.find((f: any) => f.type === "array");
    if (!arrayField?.itemSchema) return;
    // 新增操作直接写入真实数据数组，由数据变化驱动表单渲染
    return addArrayRecord(rootData.data, arrayField);
  };
}
