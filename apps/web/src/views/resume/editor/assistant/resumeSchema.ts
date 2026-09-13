import { getModelBindings } from "@/components/business/dynamicForm/code/schemaAccess";
import type { FormField, ModelBinding } from "@/components/business/dynamicForm/types";

export type ResumeModuleKind = "object" | "array" | "custom";
export type ResumeFieldValueType = "string" | "number" | "array" | "object" | "unknown";
export type ResumeFieldFormat = "month" | "monthRange" | "html" | "heightWeight";

export type ResumeFieldSchema = {
  key: string;
  label: string;
  path: string[];
  component?: string;
  valueType: ResumeFieldValueType;
  required: boolean;
  addable: boolean;
  format?: ResumeFieldFormat;
  options?: unknown[];
};

export type ResumeModuleSchema = {
  key: string;
  title: string;
  kind: ResumeModuleKind;
  dataPath: string[];
  fields: ResumeFieldSchema[];
};

export type ResumeSchemaSource = {
  key: string;
  schema: FormField | FormField[];
};

export type ResumeOptionDictionary = Record<string, Array<unknown>>;

const RESERVED_FIELDS = new Set(["collapsed", "hidden", "archived"]);

const normalizeModule = (schema: FormField | FormField[]) =>
  (Array.isArray(schema) ? schema[0] : schema) as FormField | undefined;

const isRequired = (field: FormField, inherited: boolean) =>
  inherited ||
  field.required === true ||
  field.rules?.some((rule: any) => rule?.required === true) === true;

const getFormat = (field: FormField): ResumeFieldFormat | undefined => {
  if (field.component === "datePicker" && field.props?.type === "month") return "month";
  if (field.component === "datePicker" && field.props?.type === "monthrange") return "monthRange";
  if (field.component === "wangEditor") return "html";
  if (field.component === "heightWeight") return "heightWeight";
};

const getValueType = (
  field: FormField,
  binding: ModelBinding,
  format?: ResumeFieldFormat,
): ResumeFieldValueType => {
  if (format === "monthRange") return "array";
  if (format === "heightWeight") return "object";
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

  const visit = (current: FormField | FormField[] | undefined, inheritedRequired = false) => {
    const fields = Array.isArray(current) ? current : current ? [current] : [];
    fields.forEach((field) => {
      const required = isRequired(field, inheritedRequired);
      const format = getFormat(field);
      const optionValues = getOptionValues(field, options);
      getModelBindings(field).forEach((binding) => {
        if (binding.raw || !acceptBinding(binding)) return;
        const key = binding.source[binding.source.length - 1];
        if (!key || RESERVED_FIELDS.has(key)) return;
        const next: ResumeFieldSchema = {
          key,
          label: field.label || key,
          path: [...binding.source],
          component: field.component,
          valueType: getValueType(field, binding, format),
          required,
          addable: field.addable === true,
          format,
          options: optionValues,
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
          label: field.label || previous.label,
          required: previous.required || next.required,
          addable: previous.addable || next.addable,
          options: next.options ?? previous.options,
        };
      });
      visit(field.fields, required);
      visit(field.itemSchema, required);
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
    const title = String(titleBinding?.defaultValue || module.name || key);
    const fieldSource = arrayField?.itemSchema ?? module.fields;
    const fields = collectFields(fieldSource, options, (binding) =>
      arrayField ? true : binding.source[0] === key && binding.source[1] === "data",
    );

    return [
      {
        key,
        title,
        kind,
        dataPath: arrayField?.source ? arrayField.source.slice(1) : ["data"],
        fields,
      },
    ];
  });

export const getResumeModuleSchema = (
  schema: ResumeModuleSchema[],
  moduleKey: string,
): ResumeModuleSchema | undefined =>
  moduleKey.startsWith("custom_")
    ? schema.find((module) => module.key === "custom")
    : schema.find((module) => module.key === moduleKey);
