export type ResumeModuleKind = "object" | "array" | "custom";
export type ResumeFieldValueType = "string" | "number" | "array" | "object" | "unknown";
export type ResumeFieldFormat = "month" | "html" | "heightWeight";

export type ResumeFieldPattern = {
  // 正则表达式正文。
  source: string;
  // 正则表达式标志。
  flags: string;
  // 格式不匹配时展示的中文说明。
  message?: string;
};

export type ResumeFieldSchema = {
  // 字段稳定标识。
  key: string;
  // 字段中文名称。
  label: string;
  // 字段在模块数据中的路径。
  path: string[];
  // 字段使用的表单组件。
  component?: string;
  // 字段值类型。
  valueType: ResumeFieldValueType;
  // 字段缺失时是否允许 AI 首次写入。
  addable: boolean;
  // 填写口径：true 必填，false 可选。
  required: boolean;
  // 字段格式约束。
  format?: ResumeFieldFormat;
  // 字段允许使用的枚举值。
  options?: unknown[];
  // 表单字段声明的正则格式约束。
  pattern?: ResumeFieldPattern;
};

export type ResumeModuleVariantSchema = {
  // 当前数据形态。
  kind: ResumeModuleKind;
  // 当前形态在简历模块中的存储路径。
  dataPath: string[];
  // 当前形态允许使用的业务字段。
  fields: ResumeFieldSchema[];
  // 激活当前形态的布局值，未设置时作为回退形态。
  layout?: string;
};

export type ResumeModuleSchema = ResumeModuleVariantSchema & {
  // 模块稳定标识。
  key: string;
  // 模块默认中文名称。
  title: string;
  // 同一模块可切换的数据形态。
  variants?: ResumeModuleVariantSchema[];
};

export const getResumeModuleSchema = (
  schema: ResumeModuleSchema[],
  moduleKey: string,
): ResumeModuleSchema | undefined =>
  moduleKey.startsWith("custom_")
    ? schema.find((module) => module.key === "custom")
    : schema.find((module) => module.key === moduleKey);

// 按读取数据或当前布局选择模块真实生效的字段形态。
export const resolveResumeModuleSchema = (
  module: ResumeModuleSchema | undefined,
  data?: unknown,
  layout?: string,
): ResumeModuleSchema | undefined => {
  if (!module?.variants?.length) return module;
  const byData = Array.isArray(data)
    ? module.variants.find((variant) => variant.kind !== "object")
    : data && typeof data === "object"
      ? module.variants.find((variant) => variant.kind === "object")
      : undefined;
  const byLayout = layout
    ? module.variants.find((variant) => variant.layout === layout)
    : undefined;
  const fallback = module.variants.find((variant) => !variant.layout) ?? module.variants[0];
  const active = byData ?? byLayout ?? fallback;
  return active ? { ...module, ...active } : module;
};
