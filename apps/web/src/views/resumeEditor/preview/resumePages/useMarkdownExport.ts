import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { allConfig } from "@/stores/modules/resume/formConfig";
import { getExportFileName, resumeTitle } from "../../resumeName";

type FieldDefinition = { key: string; label: string };

const resumeStore = useResumeStore();
const { currentItem, runtimeConfig } = storeToRefs(resumeStore);

const FIELD_LABELS: Record<string, string> = {
  content: "内容",
  desc: "说明",
  img: "图片",
  size: "大小",
  url: "链接",
};

// 将富文本内容转换为 Markdown 可读的纯文本
const formatText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.filter(Boolean).join(" - ");
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).filter(Boolean).join(" / ");
  }

  const text = String(value);
  if (!/<[a-z][\s\S]*>/i.test(text)) return text.trim();
  const element = document.createElement("div");
  element.innerHTML = text
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|li|h[1-6])>/gi, "\n");
  return (element.textContent || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const getBindings = (model: any) => (Array.isArray(model) ? model : model ? [model] : []);

const getDataKey = (binding: any) => {
  const source = binding?.source;
  if (!Array.isArray(source) || !source.includes("data")) return "";
  const key = source[source.length - 1];
  return key && key !== "?" ? key : "";
};

const collectFieldDefinitions = (fields: any[], definitions: FieldDefinition[]) => {
  fields?.forEach((field) => {
    getBindings(field.model).forEach((binding) => {
      const key = getDataKey(binding);
      if (!key || ["collapsed", "hidden", "archived"].includes(key)) return;
      if (definitions.some((item) => item.key === key)) return;
      definitions.push({
        key,
        label: field.label || FIELD_LABELS[key] || binding.prop || key,
      });
    });
    getBindings(field.addConfig?.model).forEach((binding) => {
      const key = getDataKey(binding);
      if (!key || ["collapsed", "hidden", "archived"].includes(key)) return;
      if (definitions.some((item) => item.key === key)) return;
      definitions.push({ key, label: FIELD_LABELS[key] || binding.prop || key });
    });
    if (Array.isArray(field.fields)) collectFieldDefinitions(field.fields, definitions);
    if (Array.isArray(field.addConfig?.fields)) {
      collectFieldDefinitions(field.addConfig.fields, definitions);
    }
  });
};

const getSchema = (moduleKey: string) => {
  const runtimeField = runtimeConfig.value?.fields?.find((field: any) => field.key === moduleKey);
  if (runtimeField?.fields || runtimeField?.type) return runtimeField;
  if (moduleKey.startsWith("custom_")) return allConfig.custom;
  return (allConfig as Record<string, any>)[moduleKey];
};

const getSchemaFields = (schema: any) => (Array.isArray(schema) ? schema : schema?.fields) || [];

const getModuleTitle = (moduleKey: string, moduleData: any, schema: any) => {
  const normalizedSchema = Array.isArray(schema) ? schema[0] : schema;
  return (
    normalizedSchema?.name ||
    normalizedSchema?.props?.name ||
    moduleData?.title ||
    { user: "个人信息", account: "社交账号", skill: "专业技能", advantage: "个人优势" }[moduleKey] ||
    moduleKey
  );
};

const getRecords = (moduleData: any) => {
  if (Array.isArray(moduleData?.data)) return moduleData.data;
  if (Array.isArray(moduleData?.data?.list)) return moduleData.data.list;
  return moduleData?.data && typeof moduleData.data === "object" ? [moduleData.data] : [];
};

const appendRecord = (lines: string[], record: Record<string, unknown>, definitions: FieldDefinition[]) => {
  const entries = definitions
    .map((definition) => ({
      ...definition,
      value: formatText(record[definition.key]),
    }))
    .filter((item) => item.value);
  if (!entries.length) return;

  const titleEntry = entries.find((item) => item.key === "name");
  if (titleEntry) {
    lines.push(`### ${titleEntry.value}`, "");
  }

  entries.forEach((entry) => {
    if (entry === titleEntry) return;
    if (entry.key === "avatar") {
      lines.push(`![头像](${entry.value})`, "");
      return;
    }
    if (entry.key === "content") {
      lines.push(entry.value, "");
      return;
    }
    lines.push(`- ${entry.label}：${entry.value}`);
  });
  lines.push("");
};

// 按当前模块顺序生成可读的 Markdown 简历
export const exportMarkdown = (onSuccess?: () => void) => {
  const item = currentItem.value;
  const data = item?.data || {};
  const configuredKeys = (runtimeConfig.value?.fields || item?.config?.fields || [])
    .map((field: any) => (typeof field === "string" ? field : field?.key))
    .filter(Boolean);
  const moduleKeys = [...new Set([...configuredKeys, ...Object.keys(data)])];
  const lines = [`# ${resumeTitle.value}`, ""];

  moduleKeys.forEach((moduleKey) => {
    const moduleData = data[moduleKey];
    if (!moduleData || moduleData.hidden || moduleData.archived) return;
    const schema = getSchema(moduleKey);
    const definitions: FieldDefinition[] = [];
    collectFieldDefinitions(getSchemaFields(schema), definitions);
    const records = getRecords(moduleData);
    if (!records.length) return;

    lines.push(`## ${getModuleTitle(moduleKey, moduleData, schema)}`, "");
    records.forEach((record) => appendRecord(lines, record, definitions));
  });

  const markdown = `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getExportFileName(resumeTitle.value, "md");
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  onSuccess?.();
};
