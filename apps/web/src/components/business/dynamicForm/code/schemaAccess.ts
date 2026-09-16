import type { FormField, ModelBinding } from "../types";
import { resolveDataPath, type DataPath, type DataPathContext } from "./pathContext";

type FormFieldSource = FormField | FormField[] | null | undefined;

// 统一返回字段的数据绑定列表，屏蔽单绑定与多绑定的结构差异
export function getModelBindings(field: FormField): ModelBinding[] {
  if (!field.model) return [];
  return Array.isArray(field.model) ? field.model : [field.model];
}

// 优先取得组件主值绑定，并排除只读的外部字典绑定
export function getPrimaryModelBinding(field: FormField): ModelBinding | undefined {
  const bindings = getModelBindings(field).filter((binding) => !binding.raw);
  return bindings.find((binding) => binding.prop === "modelValue") ?? bindings[0];
}

// 字段显示名称：字段可直接声明，也可由字段包裹组件通过 props 声明
export function getFieldLabel(field: FormField | null | undefined): string | undefined {
  return field?.label ?? field?.props?.label;
}

// 按声明顺序递归遍历普通子字段与数组子项结构
export function walkFormFields(source: FormFieldSource, visitor: (field: FormField) => void) {
  const fields = Array.isArray(source) ? source : source ? [source] : [];
  fields.forEach((field) => {
    visitor(field);
    walkFormFields(field.fields, visitor);
    walkFormFields(field.itemSchema, visitor);
  });
}

// 读取数组容器在当前对象节点内声明的真实数据路径
export function getArrayDataPath(
  field: FormField,
  context?: DataPathContext,
): DataPath | undefined {
  if (field.type !== "array") return;
  return field.source?.length ? resolveDataPath(field.source, context) : undefined;
}
