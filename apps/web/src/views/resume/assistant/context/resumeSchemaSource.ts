import {
  getFieldLabel,
  getModelBindings,
  unwrapField,
} from "@/components/business/dynamicForm/api";
import type { FormField, ModelBinding } from "@/components/business/dynamicForm/api";
import type {
  ResumeFieldFormat,
  ResumeFieldSchema,
  ResumeFieldValueType,
  ResumeModuleKind,
  ResumeModuleSchema,
  ResumeModuleVariantSchema,
} from "@snowflake/resume-agent";

export type ResumeSchemaSource = {
  // 模块稳定标识
  key: string;
  // 模块表单配置
  schema: FormField | FormField[];
};

export type ResumeOptionDictionary = Record<string, Array<unknown>>;

const RESERVED_FIELDS = new Set(["collapsed", "hidden", "moreCollapsed"]);

const normalizeModule = (schema: FormField | FormField[]) =>
  (Array.isArray(schema) ? schema[0] : schema) as FormField | undefined;

const getFormat = (field: FormField): ResumeFieldFormat | undefined => {
  if (
    (field.component === "datePicker" || field.component === "datePickerPresent") &&
    field.props?.type === "month"
  ) {
    return "month";
  }
  if (field.component === "wangEditor" || field.component === "resumeContentEditor") return "html";
  if (field.component === "heightWeight") return "heightWeight";
};

const getValueType = (
  field: FormField,
  binding: ModelBinding,
  format?: ResumeFieldFormat,
): ResumeFieldValueType => {
  // 复合输入组件即使未声明默认值，也必须按真实对象结构生成契约
  if (format === "heightWeight" || ["measurements", "sizes"].includes(field.component ?? "")) return "object";
  if (field.component === "inputNumber") return "number";
  const defaultValue = binding.defaultValue;
  if (Array.isArray(defaultValue)) return "array";
  if (defaultValue !== null && typeof defaultValue === "object") return "object";
  if (["string", "number"].includes(typeof defaultValue)) {
    return typeof defaultValue as "string" | "number";
  }
  return field.component ? "string" : "unknown";
};

const getOptionValues = (field: FormField, options: ResumeOptionDictionary) => {
  // 岗位选择器支持自定义名称，推荐字典不能作为封闭枚举限制导入。
  if (field.component === "positionPicker") return;
  const rawBinding = getModelBindings(field).find((binding) => binding.raw);
  const optionKey = rawBinding?.source?.[rawBinding.source.length - 1];
  const list = optionKey ? options[optionKey] : undefined;
  if (!Array.isArray(list)) return;
  // 字典既支持值数组，也支持表单常用的 name/value 对象数组
  return list.map((item: any) =>
    item && typeof item === "object" && "value" in item ? item.value : item,
  );
};

const collectFields = (
  source: FormField | FormField[] | undefined,
  options: ResumeOptionDictionary,
  acceptBinding: (binding: ModelBinding) => boolean,
) => {
  const result: ResumeFieldSchema[] = [];
  const positions = new Map<string, number>();

  const visit = (current: FormField | FormField[] | undefined) => {
    const fields = Array.isArray(current) ? current : current ? [current] : [];
    fields.forEach((field) => {
      // 字段包裹组：名称在包裹组上，其余配置以内层字段为准
      const target = unwrapField(field) ?? field;
      const wrapped = target !== field;
      const format = getFormat(target);
      const optionValues = getOptionValues(target, options);
      const patternRule = [...(field.rules ?? []), ...(target === field ? [] : (target.rules ?? []))]
        .find((rule: any) => rule?.pattern instanceof RegExp);
      // 仅单业务绑定的普通字段允许回退到字段级 required；复合组件按绑定逐个声明
      const businessBindings = getModelBindings(target).filter((binding) => !binding.raw);
      getModelBindings(target).forEach((binding) => {
        if (binding.raw || !acceptBinding(binding)) return;
        const key = binding.source[binding.source.length - 1];
        if (!key || RESERVED_FIELDS.has(key)) return;
        const next: ResumeFieldSchema = {
          key,
          label: getFieldLabel(field) || getFieldLabel(target) || key,
          path: [...binding.source],
          component: target.component,
          valueType: getValueType(target, binding, format),
          addable: target.addable === true,
          // 绑定显式声明优先；单绑定普通字段回退到字段级标记
          required:
            binding.required ??
            (businessBindings.length === 1 ? target.required === true : false),
          format,
          options: optionValues,
          pattern: patternRule?.pattern
            ? {
                source: patternRule.pattern.source,
                flags: patternRule.pattern.flags,
                message: patternRule.message,
              }
            : undefined,
        };
        const position = positions.get(key);
        if (position === undefined) {
          positions.set(key, result.length);
          result.push(next);
          return;
        }
        const previous = result[position]!;
        // 同一字段在容器标题和输入组件重复声明时，保留更具体的输入定义
        result[position] = {
          ...previous,
          ...next,
          label: getFieldLabel(field) || previous.label,
          addable: previous.addable || next.addable,
          required: previous.required || next.required,
          options: next.options ?? previous.options,
          pattern: next.pattern ?? previous.pattern,
        };
      });
      // 已用被包裹字段展开时不再递归，避免重复登记
      if (wrapped) return;
      visit(field.fields);
      visit(field.itemSchema);
    });
  };

  visit(source);
  return result;
};

// 将表单配置转换为 AI 与写入校验共用的简历领域结构
export const buildResumeSchema = (
  sources: ResumeSchemaSource[],
  options: ResumeOptionDictionary = {},
): ResumeModuleSchema[] =>
  sources.flatMap(({ key, schema }) => {
    const module = normalizeModule(schema);
    if (!module) return [];
    const arrayField = module.fields?.find(
      (field) => field.type === "array" && field.itemSchema && field.source?.length,
    );
    const kind: ResumeModuleKind = key === "custom" ? "custom" : arrayField ? "array" : "object";
    const titleBinding = getModelBindings(module).find((binding) => binding.prop === "title");
    // 模块标题取模板声明的标题默认值，缺失时回退模块 key
    const title = String(titleBinding?.defaultValue || key);
    const fieldSource = arrayField?.itemSchema ?? module.fields;
    const fields = collectFields(fieldSource, options, (binding) =>
      arrayField ? true : binding.source[0] === "data",
    );
    const objectFields = collectFields(
      module.fields?.filter((field) => field.type !== "array"),
      options,
      (binding) => binding.source[0] === "data",
    );
    const variants: ResumeModuleVariantSchema[] = [];
    if (objectFields.length) {
      variants.push({
        kind: "object",
        dataPath: ["data"],
        fields: objectFields,
      });
    }
    if (arrayField?.source) {
      variants.push({
        kind: key === "custom" ? "custom" : "array",
        dataPath: [...arrayField.source],
        fields,
        layout:
          typeof module.props?.addWhenLayout === "string"
            ? module.props.addWhenLayout
            : undefined,
      });
    }

    return [
      {
        key,
        title,
        kind,
        dataPath: arrayField?.source ? [...arrayField.source] : ["data"],
        fields,
        variants: variants.length > 1 ? variants : undefined,
      },
    ];
  });
