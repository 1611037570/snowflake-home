import { toRaw } from "vue";
import { allConfig, DEFAULT_USER_FORM } from "../formConfig";

// 按 key 补齐数组模块的子项 list：list 数量与 data 条数一致，缺多少补多少
function fillArrayListByData(field: any, data: any) {
  const arrayField = field.fields?.find((f: any) => f.type === "array");
  if (!arrayField?.addConfig) return;
  const source: string[] | undefined = arrayField.addConfig.model?.[0]?.source;
  if (!Array.isArray(source)) return;
  const index = source.indexOf("?");
  if (index === -1) return;
  const dataArray = source.slice(0, index).reduce((acc: any, key: string) => acc?.[key], data);
  const count = Array.isArray(dataArray) ? dataArray.length : 0;
  while (arrayField.list.length < count) {
    // 先解包响应式代理再克隆，避免 structuredClone 命中 Vue Proxy 抛出 DataCloneError
    arrayField.list.push({ ...toRaw(arrayField.addConfig) });
  }
}

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
  if (arrayField?.addConfig) {
    arrayField.addConfig.model?.forEach((item: any) => {
      if (Array.isArray(item.source)) {
        item.source[0] = customKey;
      }
    });
    arrayField.addConfig.fields?.forEach((subField: any) => {
      if (Array.isArray(subField.model?.source)) {
        subField.model.source[0] = customKey;
      }
    });
  }
}

// 模板注册表：user 与其它预设模块统一从默认配置展开
export function getModuleTemplate(key: string) {
  if (key === "user") return DEFAULT_USER_FORM[0];
  if (key.startsWith("custom_")) return allConfig.custom;
  return (allConfig as Record<string, any>)[key];
}

// 持久化字段列表展开为可渲染的完整 schema，并按 data 补齐数组子项
export function expandConfigFields(fields: any[], data: any) {
  return fields.map((item: any) => {
    // 已是完整 schema（旧导入数据）直接保留，仅补子项
    if (item?.type || item?.component) {
      const field = structuredClone(item);
      fillArrayListByData(field, data);
      return field;
    }
    const template = getModuleTemplate(item.key);
    if (!template) return item;
    const field = structuredClone(template);
    if (String(item.key).startsWith("custom_")) {
      const customTitle = data?.[item.key]?.ui?.title || "";
      rewriteCustomFieldByKey(field, item.key, customTitle);
    }
    fillArrayListByData(field, data);
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
    const model = arrayField?.addConfig?.model;
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
