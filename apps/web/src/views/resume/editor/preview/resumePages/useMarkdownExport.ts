import { storeToRefs } from "pinia";
import {
  getFieldDataPath,
  getFieldLabel,
  walkFormFields,
} from "@/components/business/dynamicForm/api";
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
    return Object.values(value as Record<string, unknown>)
      .filter(Boolean)
      .join(" / ");
  }

  const text = String(value);
  if (!/<[a-z][\s\S]*>/i.test(text)) return text.trim();
  const element = document.createElement("div");
  element.innerHTML = text.replace(/<br\s*\/?\s*>/gi, "\n").replace(/<\/(p|li|h[1-6])>/gi, "\n");
  return (element.textContent || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const collectFieldDefinitions = (fields: any[], definitions: FieldDefinition[]) => {
  walkFormFields(fields, (field) => {
    // 字段包裹组按被包裹字段定位数据，名称取包裹组声明
    const path = getFieldDataPath(field);
    const key = path?.[path.length - 1];
    if (!key || ["collapsed", "hidden", "archived", "icon"].includes(key)) return;
    if (definitions.some((item) => item.key === key)) return;
    definitions.push({
      key,
      label: getFieldLabel(field) || FIELD_LABELS[key] || key,
    });
  });
};

const getSchema = (moduleKey: string) => {
  // 运行时配置已按模板展开为完整 schema，未命中时回退模板注册表
  const runtimeField = runtimeConfig.value?.fields?.find((field: any) => field.key === moduleKey);
  if (runtimeField) return runtimeField;
  if (moduleKey.startsWith("custom_")) return allConfig.custom;
  return (allConfig as Record<string, any>)[moduleKey];
};

const getSchemaFields = (schema: any) => (Array.isArray(schema) ? schema : schema?.fields) || [];

// 模块标题：优先模块 ui.title，其次模板声明的标题默认值
const getModuleTitle = (moduleKey: string, moduleData: any, schema: any) => {
  const normalizedSchema = Array.isArray(schema) ? schema[0] : schema;
  return (
    moduleData?.ui?.title ||
    normalizedSchema?.model?.find((item: any) => item?.prop === "title")?.defaultValue ||
    { user: "个人信息", account: "社交账号", skill: "专业技能", advantage: "个人优势" }[
      moduleKey
    ] ||
    moduleKey
  );
};

// 数组模块按 list 取记录，对象模块把 data 视为单条记录
const getRecords = (moduleData: any) => {
  if (Array.isArray(moduleData?.list)) return moduleData.list.map((record: any) => record.data);
  return moduleData?.data && typeof moduleData.data === "object" ? [moduleData.data] : [];
};

const appendRecord = (
  lines: string[],
  record: Record<string, unknown>,
  definitions: FieldDefinition[],
) => {
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
  // 字段配置统一以模块 key 标识
  const configuredKeys = (runtimeConfig.value?.fields || item?.config?.fields || [])
    .map((field: any) => field?.key)
    .filter(Boolean);
  const moduleKeys = [...new Set([...configuredKeys, ...Object.keys(data)])];
  const lines = [`# ${resumeTitle.value}`, ""];

  moduleKeys.forEach((moduleKey) => {
    const moduleData = data[moduleKey];
    if (!moduleData || moduleData.ui?.hidden || moduleData.ui?.archived) return;
    const schema = getSchema(moduleKey);
    const definitions: FieldDefinition[] = [];
    collectFieldDefinitions(getSchemaFields(schema), definitions);
    const records = getRecords(moduleData);
    if (!records.length) return;

    lines.push(`## ${getModuleTitle(moduleKey, moduleData, schema)}`, "");
    records.forEach((record) => appendRecord(lines, record, definitions));
  });

  const markdown = `${lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()}\n`;
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
