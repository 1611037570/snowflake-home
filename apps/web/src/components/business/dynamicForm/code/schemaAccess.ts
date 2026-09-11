import type { FormField, ModelBinding } from "../types";

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

// 按声明顺序递归遍历普通子字段与数组子项结构
export function walkFormFields(source: FormFieldSource, visitor: (field: FormField) => void) {
  const fields = Array.isArray(source) ? source : source ? [source] : [];
  fields.forEach((field) => {
    visitor(field);
    walkFormFields(field.fields, visitor);
    walkFormFields(field.itemSchema, visitor);
  });
}

// 从数组子项绑定中解析真实数据数组路径，不依赖固定的绑定位置
export function getArrayDataPath(field: FormField): string[] | undefined {
  if (field.type !== "array") return;
  // 数组容器显式声明的数据源优先于子项路径推导
  if (field.source?.length) return [...field.source];
  if (!field.itemSchema) return;
  let result: string[] | undefined;
  walkFormFields(field.itemSchema, (child) => {
    if (result) return;
    const binding = getModelBindings(child).find((item) => !item.raw && item.source.includes("?"));
    if (!binding) return;
    result = binding.source.slice(0, binding.source.indexOf("?"));
  });
  return result;
}
