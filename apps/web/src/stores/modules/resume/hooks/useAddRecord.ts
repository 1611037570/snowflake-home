import { getModelBindings, walkFormFields } from "@/components/business/dynamicForm";
import { allConfig } from "../formConfig";

/**
 * 按模块默认表单的 itemSchema 推导数组记录字段骨架
 * 供 AI 新增记录时先落一条含字段的空记录，保证预览草稿与编辑器表单可正常绑定
 */
export function createRecordSkeleton(moduleKey: string): Record<string, any> {
  const isCustomModule = moduleKey.startsWith("custom");
  const template: any = isCustomModule
    ? allConfig.custom
    : (allConfig as Record<string, any>)[moduleKey];
  const arrayField = template?.fields?.find((field: any) => field.type === "array");
  const itemSchema = arrayField?.itemSchema;
  const keys = new Set<string>();
  const collectSource = (source: string[]) => {
    if (Array.isArray(source) && source.length) keys.add(String(source[source.length - 1]));
  };
  walkFormFields(itemSchema, (field) => {
    getModelBindings(field).forEach((binding) => {
      if (!binding.raw) collectSource(binding.source);
    });
  });
  const record: Record<string, any> = {};
  keys.forEach((key) => {
    record[key] = "";
  });
  return record;
}
