import { isResumeMediaField } from "@snowflake/resume-core/mediaFields";
import { DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/config/defaultConfig";
import { $t } from "@/locales";
import { translateResumeEditorText } from "@/stores/modules/resume/hooks/useResumeEditorLocale";
import { RESUME_SCHEMA, normalizeRichTextHtml, resolveResumeModuleSchema, type ResumeFieldSchema, type ResumeModuleSchema } from "@snowflake/resume-core";
import { assertResumeAiResponseComplete, readResumeAiResponseText } from "@snowflake/resume-agent";
import { isContentEmpty } from "../shared/validData";

const MODULE_SCHEMA = new Map(
  RESUME_SCHEMA.filter((module) => module.kind !== "custom").map((module) => [module.key, module]),
);
const MODULE_ORDER = DEFAULT_MODULE_NAMES.map((module) => module.key).filter((key) =>
  MODULE_SCHEMA.has(key),
);

const isRecord = (value: unknown): value is Record<string, any> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const hasValue = (value: unknown): boolean =>
  value !== undefined &&
  value !== null &&
  value !== "" &&
  (!Array.isArray(value) || value.some(hasValue)) &&
  (!isRecord(value) || Object.values(value).some(hasValue));

// 去除 Markdown 代码围栏并提取首个 JSON 对象，降低模型额外输出对导入的影响。
export const parseJsonText = (text: string): Record<string, any> => {
  const normalized = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const start = normalized.indexOf("{");
  const end = normalized.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error($t("resumeImportInvalidJson"));
  const parsed = JSON.parse(normalized.slice(start, end + 1));
  if (!isRecord(parsed)) throw new Error($t("resumeImportJsonNotObject"));
  return parsed;
};

const unwrapModuleData = (value: any) =>
  isRecord(value) && Object.prototype.hasOwnProperty.call(value, "data") ? value.data : value;

// 模型常见命名按相同语义映射到现有模块，不要求逐字匹配字段契约。
const MODULE_ALIASES: Record<string, string[]> = {
  // 个人资料
  user: ["basic", "personal", "personalInfo"],
  // 工作经历
  work: ["experience", "workExperience"],
  // 实习经历
  internship: ["internshipExperience"],
  // 项目经历
  project: ["projects"],
  // 教育经历
  education: ["educations"],
  // 专业技能
  skill: ["skills"],
};
const FIELD_ALIASES: Record<string, string[]> = {
  // 开始月份
  startTime: ["startDate"],
  // 结束月份
  endTime: ["endDate"],
  // 经历正文
  content: ["description", "details", "summary"],
  // 经历岗位或教育专业
  post: ["position", "role", "major"],
  // 学历
  education: ["degree"],
};

const toText = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join("\n");
  return isRecord(value) ? JSON.stringify(value) : "";
};
// 提示文案里的模块与字段名按当前语言展示，模型字段匹配仍使用 schema 源文案。
const localizeSchemaText = (value: string) => String(translateResumeEditorText(value));
// 导入只做编辑器必需的形态转换，不复用 AI 写入的整批拒绝规则。
const normalizeFieldValue = (value: unknown, field: ResumeFieldSchema, warn: (value: unknown) => void): unknown => {
  if (field.format === "html") {
    const clean = normalizeRichTextHtml(toText(value));
    // 清洗后只有空标签不算有效正文。
    return isContentEmpty(clean) ? undefined : clean;
  }
  if (field.format === "month") {
    const text = toText(value).trim();
    if (field.key === "endTime" && /^(至今|现在|目前|present|current|now|ongoing)$/i.test(text)) return "至今";
    const match = text.match(/^(\d{4})[.\/年-](\d{1,2})(?:月|[.\/-]\d{1,2})?$/);
    if (match && Number(match[2]) >= 1 && Number(match[2]) <= 12) {
      return `${match[1]}.${match[2]!.padStart(2, "0")}`;
    }
    // 缺少月份不能猜测，提示原值而不阻断同份简历的其他内容。
    warn(value);
    return undefined;
  }
  if (field.valueType === "string") return toText(value);
  if (field.valueType === "number") {
    const number = typeof value === "string" && value.trim() ? Number(value.trim()) : value;
    if (typeof number === "number" && Number.isFinite(number)) return number;
  } else if (field.valueType === "array") {
    return Array.isArray(value) ? value : [value];
  } else if (field.valueType === "object") {
    if (isRecord(value)) return value;
  } else {
    return value;
  }
  warn(value);
  return undefined;
};

const pickRecordFields = (value: any, module: ResumeModuleSchema, warnings: string[]) => {
  if (isRecord(value?.data)) value = value.data;
  if (!isRecord(value)) {
    const content = module.fields.find((field) => field.format === "html");
    if (content && hasValue(value)) value = { [content.key]: value };
    else {
      if (hasValue(value)) warnings.push($t("resumeImportWarningUnmatchedContent", { module: localizeSchemaText(module.title), content: toText(value) }));
      return {};
    }
  }
  const record: Record<string, unknown> = {};
  const consumed = new Set<string>();
  module.fields.filter((field) => !isResumeMediaField(module.key, field.key)).forEach((field) => {
    const names = [field.key, field.label, ...(FIELD_ALIASES[field.key] ?? [])];
    if (field.key === "name") {
      // 工作与实习经历均接受公司名称别名。
      if (["work", "internship"].includes(module.key)) names.push("company");
      if (module.key === "education") names.push("school", "institution");
      if (module.key === "user") names.push("fullName");
    }
    const name = names.find((key) => Object.prototype.hasOwnProperty.call(value, key) && hasValue(value[key]));
    if (!name) return;
    consumed.add(name);
    const normalized = normalizeFieldValue(value[name], field, (original) => {
      warnings.push($t("resumeImportWarningFieldMissing", { module: localizeSchemaText(module.title), field: localizeSchemaText(field.label), content: toText(original) }));
    });
    if (hasValue(normalized)) record[field.key] = normalized;
  });
  // 无法识别的字段单独提示，已识别字段照常导入。
  Object.entries(value).forEach(([key, original]) => {
    if (!consumed.has(key) && hasValue(original) && !isResumeMediaField(module.key, key)) {
      warnings.push($t("resumeImportWarningUnknownField", { module: localizeSchemaText(module.title), field: key, content: toText(original) }));
    }
  });
  return record;
};

// 数组经历兼容单条对象与列表包装，正文模块兼容直接文本或文本数组。
const normalizeModuleData = (value: any, module: ResumeModuleSchema, warnings: string[]) => {
  const rawData = unwrapModuleData(value);
  if (module.kind === "array") {
    const records = Array.isArray(value?.list) ? value.list : Array.isArray(rawData?.list) ? rawData.list
      : Array.isArray(rawData) ? rawData : hasValue(rawData) ? [rawData] : [];
    return records.map((record: any) => pickRecordFields(record, module, warnings))
      .filter((record: Record<string, unknown>) => Object.keys(record).length > 0);
  }
  return pickRecordFields(rawData, module, warnings);
};

// 兼容模型返回完整简历包装层或直接返回模块对象。
const getSourceData = (parsed: Record<string, any>) => {
  if (isRecord(parsed.resume))
    return isRecord(parsed.resume.data) ? parsed.resume.data : parsed.resume;
  if (isRecord(parsed.data)) return parsed.data;
  return parsed;
};

export const normalizeResumeData = (parsed: Record<string, any>) => {
  const source = getSourceData(parsed);
  const data: Record<string, any> = {};
  const warnings: string[] = [];
  const consumed = new Set<string>();
  MODULE_ORDER.forEach((key) => {
    const module = MODULE_SCHEMA.get(key)!;
    const names = [key, module.title, ...(MODULE_ALIASES[key] ?? [])];
    const sources = names.filter((name) => hasValue(source[name]));
    // 相同语义的模块别名均参与提取，避免模型混用命名时遗漏记录。
    sources.forEach((name) => {
      consumed.add(name);
      // 同一模块按草稿数据选择当前形态，技能正文不能按评分列表字段转换。
      const sourceData = unwrapModuleData(source[name]);
      const variantData = isRecord(sourceData) && Array.isArray(sourceData.list) ? sourceData.list : sourceData;
      const activeModule = resolveResumeModuleSchema(module, variantData) ?? module;
      const normalized = normalizeModuleData(source[name], activeModule, warnings);
      if (activeModule.kind === "array") {
        if (normalized.length) {
          const records = normalized.map((record: Record<string, any>) => ({
            // 提取并转换后的业务字段
            data: record,
            // 编辑器记录状态由默认配置补齐
            ui: {},
          }));
          if (data[key]) data[key].list.push(...records);
          else data[key] = { list: records };
        }
      } else if (Object.keys(normalized).length) {
        // 同名字段优先保留稳定模块键中的结果。
        data[key] = { data: { ...normalized, ...data[key]?.data } };
      }
    });
  });
  Object.entries(source).forEach(([key, value]) => {
    if (!consumed.has(key) && hasValue(value) && !["title", "warnings", "config", "ui", "usage", "id"].includes(key)) {
      warnings.push($t("resumeImportWarningUnknownModule", { module: key, content: toText(value) }));
    }
  });
  // 只在完全没有可用内容时失败，单个字段不符合格式不会拦截整份简历。
  if (!Object.keys(data).length) throw new Error($t("resumeImportNoContent"));
  if (!data.user) data.user = { data: {} };
  const modules = MODULE_ORDER.filter((key) => data[key]).map((key) => ({ key }));
  return {
    // 可交给简历仓库的模块数据
    data,
    // 本次有内容的模块顺序
    config: { modules },
    // 无法自动转换的原内容，仅供导入提示，不写入简历
    warnings,
  };
};

// 两种文档共用完整性检查、字段转换与安全清洗，不按文件类型区别处理。
export const readResumeImportResult = (response: any, onProgress: (message: string) => void) => {
  assertResumeAiResponseComplete(response);
  const text = readResumeAiResponseText(response);
  if (!text) throw new Error($t("resumeImportEmptyResponse"));
  onProgress($t("resumeImportValidatingFields"));
  return normalizeResumeData(parseJsonText(text));
};
