import { cloneDeep } from "lodash-es";

export type DesensitizeFieldGroup = "personal" | "experience";

export interface DesensitizeFieldOption {
  key: string; // 脱敏字段标识
  name: string; // 脱敏字段名称
  description: string; // 脱敏字段作用说明
  group: DesensitizeFieldGroup; // 脱敏字段所属分组
}

export interface DesensitizeFieldGroupOption {
  key: DesensitizeFieldGroup; // 脱敏分组标识
  name: string; // 脱敏分组名称
  description: string; // 脱敏分组作用说明
}

export const DESENSITIZE_FIELD_GROUP_OPTIONS: DesensitizeFieldGroupOption[] = [
  { key: "personal", name: "个人信息", description: "保护身份、联系方式与个人属性" },
  { key: "experience", name: "经历信息", description: "保护工作单位与学校名称" },
];

export const DESENSITIZE_FIELD_OPTIONS = [
  { key: "name", name: "姓名", description: "隐藏姓名及正文中的相同内容", group: "personal" },
  { key: "phone", name: "电话", description: "隐藏联系电话及正文中的手机号", group: "personal" },
  { key: "email", name: "邮箱", description: "隐藏邮箱及正文中的邮箱地址", group: "personal" },
  { key: "wechat", name: "微信", description: "隐藏微信账号及正文中的相同内容", group: "personal" },
  { key: "birthday", name: "出生日期", description: "隐藏个人出生日期", group: "personal" },
  { key: "sex", name: "性别", description: "隐藏个人性别", group: "personal" },
  { key: "marital", name: "婚姻状况", description: "隐藏个人婚姻状况", group: "personal" },
  { key: "nation", name: "民族", description: "隐藏个人民族信息", group: "personal" },
  { key: "political", name: "政治面貌", description: "隐藏个人政治面貌", group: "personal" },
  { key: "nativePlace", name: "籍贯", description: "隐藏个人籍贯", group: "personal" },
  { key: "sourcePlace", name: "生源地", description: "隐藏个人生源地", group: "personal" },
  { key: "heightWeight", name: "身高体重", description: "隐藏个人身高与体重", group: "personal" },
  { key: "measurements", name: "身体围度", description: "隐藏个人身体围度", group: "personal" },
  { key: "sizes", name: "穿着尺码", description: "隐藏个人穿着尺码", group: "personal" },
  { key: "workOrganization", name: "工作单位", description: "隐藏公司名称及正文中的相同内容", group: "experience" },
  { key: "educationOrganization", name: "学校名称", description: "隐藏学校名称及正文中的相同内容", group: "experience" },
] as const satisfies readonly DesensitizeFieldOption[];

export type DesensitizeField = (typeof DESENSITIZE_FIELD_OPTIONS)[number]["key"];

export interface DesensitizeConfig {
  selectedFields: DesensitizeField[]; // 用户选择发送给模型前需要脱敏的字段
}

interface ResumeItemLike {
  data?: Record<string, any>; // 简历模块业务数据。
  [key: string]: any; // 简历编号、结构、界面及使用信息等其余属性。
}

export const ALL_DESENSITIZE_FIELDS = DESENSITIZE_FIELD_OPTIONS.map((item) => item.key);
const PERSONAL_DESENSITIZE_FIELDS = DESENSITIZE_FIELD_OPTIONS
  .filter((item) => item.group === "personal")
  .map((item) => item.key);

export const DESENSITIZE_PRESET_OPTIONS = [
  {
    key: "normal",
    name: "普通脱敏",
    description: "隐藏姓名、电话、邮箱与微信",
    fields: ["name", "phone", "email", "wechat"],
  },
  {
    key: "strict",
    name: "严格脱敏",
    description: "隐藏全部个人信息",
    fields: PERSONAL_DESENSITIZE_FIELDS,
  },
  {
    key: "all",
    name: "全部选择",
    description: "隐藏个人信息、工作单位与学校名称",
    fields: ALL_DESENSITIZE_FIELDS,
  },
] as const;

// 优先展示命中的预设名称，其余组合明确标记为自定义。
export const getDesensitizeSelectionName = (fields: DesensitizeField[]) => {
  if (!fields.length) return "未脱敏";
  const selectedFields = new Set(fields);
  const preset = DESENSITIZE_PRESET_OPTIONS.find(
    (item) => item.fields.length === fields.length && item.fields.every((field) => selectedFields.has(field)),
  );
  return preset?.name ?? `自定义脱敏 ${fields.length} 项`;
};

export const DESENSITIZED_TEXT = "[数据已脱敏]";
const PHONE_PATTERN = /1[3-9]\d{9}/g;
const EMAIL_PATTERN = /[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/g;

const sanitizeText = (
  value: string,
  sensitiveValues: string[],
  selectedFields: Set<DesensitizeField>,
) => {
  let result = value;
  if (selectedFields.has("email")) result = result.replace(EMAIL_PATTERN, DESENSITIZED_TEXT);
  if (selectedFields.has("phone")) result = result.replace(PHONE_PATTERN, DESENSITIZED_TEXT);
  sensitiveValues.forEach((item) => {
    result = result.split(item).join(DESENSITIZED_TEXT);
  });
  return result;
};

const sanitizeTree = (
  value: unknown,
  sensitiveValues: string[],
  selectedFields: Set<DesensitizeField>,
): unknown => {
  if (typeof value === "string") return sanitizeText(value, sensitiveValues, selectedFields);
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeTree(item, sensitiveValues, selectedFields));
  }
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, sanitizeTree(item, sensitiveValues, selectedFields)]),
  );
};

const maskFieldValue = (value: unknown): unknown => {
  return value === null || value === undefined || value === "" ? value : DESENSITIZED_TEXT;
};

// 导出只使用脱敏副本，保留原简历数据和编辑状态。
export const createDesensitizedResumeItem = (
  item: ResumeItemLike,
  fields: DesensitizeField[],
): ResumeItemLike => {
  const selectedFields = new Set(normalizeDesensitizeFields({ selectedFields: fields }));
  const clone = cloneDeep(item);
  if (!selectedFields.size || !item?.data || !clone?.data) return clone;

  const sensitiveValues = ["name", "phone", "email", "wechat"]
    .filter((field) => selectedFields.has(field as DesensitizeField))
    .map((field) => item.data?.user?.data?.[field])
    .filter((value): value is string => typeof value === "string" && Boolean(value.trim()));
  [
    { key: "work", field: "workOrganization" },
    { key: "education", field: "educationOrganization" },
  ].forEach(({ key, field }) => {
    if (!selectedFields.has(field as DesensitizeField)) return;
    item.data?.[key]?.list?.forEach((record: any) => {
      const name = record.data?.name;
      if (typeof name === "string" && name.trim()) sensitiveValues.push(name);
    });
  });
  sensitiveValues.sort((a, b) => b.length - a.length);
  clone.data = sanitizeTree(clone.data, sensitiveValues, selectedFields) as Record<string, any>;

  const user = clone.data.user;
  PERSONAL_DESENSITIZE_FIELDS.forEach((field) => {
    if (!selectedFields.has(field) || !user?.data || user.data[field] == null || user.data[field] === "") return;
    user.data[field] = maskFieldValue(user.data[field]);
    if (field === "birthday") {
      user.ui = user.ui || {};
      user.ui.birthday = { ...user.ui.birthday, display: "date" };
    }
  });
  return clone;
};

// 兼容旧版不脱敏、普通脱敏与严格脱敏配置，并过滤未知字段。
export const normalizeDesensitizeFields = (value: unknown): DesensitizeField[] => {
  if (!value || typeof value !== "object") return [];
  const config = value as Record<string, unknown>;
  if (Array.isArray(config.selectedFields)) {
    const validFields = new Set<DesensitizeField>(ALL_DESENSITIZE_FIELDS);
    return [...new Set(config.selectedFields.filter(
      (field): field is DesensitizeField => typeof field === "string" && validFields.has(field as DesensitizeField),
    ))];
  }
  if (config.disabled !== false) return [];
  return config.level === "strict" ? [...ALL_DESENSITIZE_FIELDS] : [...PERSONAL_DESENSITIZE_FIELDS];
};
