import { allConfig, DEFAULT_USER_FORM } from "../formConfig";

// 自定义模块：按实际 key 重写模板，标题取自模块 ui
function rewriteCustomFieldByKey(field: any, customKey: string, customTitle: string) {
  field.key = customKey;
  field.model?.forEach((item: any) => {
    if (Array.isArray(item.source)) {
      item.source[0] = customKey;
      if (item.prop === "title") {
        item.defaultValue = customTitle;
      }
    }
  });
  if (Array.isArray(field.checks?.muted?.path)) {
    field.checks.muted.path[0] = customKey;
  }
  if (Array.isArray(field.checks?.visible?.path)) {
    field.checks.visible.path[0] = customKey;
  }
  const arrayField = field.fields?.find((f: any) => f.type === "array");
  if (arrayField?.itemSchema) {
    if (Array.isArray(arrayField.source)) {
      arrayField.source[0] = customKey;
    }
  }
}

// 模板注册表：user 与其它预设模块统一从默认配置展开
export function getModuleTemplate(key: string) {
  if (key === "user") return DEFAULT_USER_FORM[0];
  if (key.startsWith("custom_")) return allConfig.custom;
  return (allConfig as Record<string, any>)[key];
}

// 持久化字段列表展开为可渲染的完整 schema
export function expandConfigFields(fields: any[], data: any) {
  return fields.map((item: any) => {
    const template = getModuleTemplate(item.key);
    if (!template) return item;
    const field = structuredClone(template);
    if (String(item.key).startsWith("custom_")) {
      const customTitle = data?.[item.key]?.ui?.title || "";
      rewriteCustomFieldByKey(field, item.key, customTitle);
    }
    return field;
  });
}

// 可渲染配置压缩为持久化字段列表：只保留模块 key 与顺序
export function compactConfigFields(fields: any[]) {
  return fields.map((field: any) => ({ key: field.key }));
}

// 将记录折叠默认值绑定为运行时函数，新增记录时按当前设置落值
export function bindCollapsedDefault(fields: any[], getDefault: () => string[]) {
  fields.forEach((field: any) => {
    const arrayField = field?.fields?.find((item: any) => item?.type === "array");
    const model = arrayField?.itemSchema?.model;
    if (!Array.isArray(model)) return;
    model.forEach((binding: any) => {
      if (binding?.prop === "collapsed") binding.defaultValue = getDefault;
    });
  });
}

// 按持久化 key 配置构建编辑器会话使用的完整表单配置
export function buildRuntimeConfig(config: any, data: any) {
  return {
    ...config,
    fields: expandConfigFields(config?.fields || [], data),
  };
}
