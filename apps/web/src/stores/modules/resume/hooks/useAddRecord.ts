import { allConfig } from "../formConfig";

/**
 * 按模块默认表单的 addConfig 推导数组记录字段骨架
 * 供 AI 新增记录时先落一条含字段的空记录，保证预览草稿与编辑器表单可正常绑定
 */
export function createRecordSkeleton(moduleKey: string): Record<string, any> {
  const isCustomModule = moduleKey.startsWith("custom");
  const template: any = isCustomModule
    ? allConfig.custom
    : (allConfig as Record<string, any>)[moduleKey];
  const arrayField = template?.fields?.find((field: any) => field.type === "array");
  const addConfig = arrayField?.addConfig;
  const keys = new Set<string>();
  const collectSource = (source: unknown) => {
    if (Array.isArray(source) && source.length) keys.add(String(source[source.length - 1]));
  };
  addConfig?.model?.forEach((item: any) => collectSource(item?.source));
  addConfig?.fields?.forEach((field: any) => collectSource(field?.model?.source));
  const record: Record<string, any> = {};
  keys.forEach((key) => {
    record[key] = "";
  });
  return record;
}
