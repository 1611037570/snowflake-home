import { allConfig } from "../formConfig";

// 数组型模块按 data 条数补齐 list，不清空已有 list 仅追加缺失子项
function fillArrayListByData(field: any, data: any) {
  const arrayField = field.fields?.find((f: any) => f.type === "array");
  if (!arrayField?.addConfig) return;
  // 由 addConfig 首项绑定路径解析数据数组路径（截取 "?" 之前的部分）
  const source: string[] | undefined = arrayField.addConfig.model?.[0]?.source;
  if (!Array.isArray(source)) return;
  const index = source.indexOf("?");
  if (index === -1) return;
  const dataArray = source
    .slice(0, index)
    .reduce((acc: any, key: string) => acc?.[key], data);
  const count = Array.isArray(dataArray) ? dataArray.length : 0;
  while (arrayField.list.length < count) {
    arrayField.list.push(structuredClone(arrayField.addConfig));
  }
}

// 自定义模块 key 为 custom_随机串，将 custom 默认模板的 key 与数据路径首段改写为实际 key
function rewriteCustomFieldByKey(field: any, customKey: string, customName: string) {
  field.key = customKey;
  field.name = customName;
  field.model?.forEach((item: any) => {
    if (Array.isArray(item.source)) {
      item.source[0] = customKey;
      if (item.prop === "name") {
        item.defaultValue = customName;
      }
    }
  });
  if (Array.isArray(field.checks?.hidden?.path)) {
    field.checks.hidden.path[0] = customKey;
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

// 以简历 data 为准，将各模块表单配置刷新为最新默认配置，返回是否存在变更
export function useRefreshConfigByData() {
  const refreshConfigByData = (item: any): boolean => {
    const data = item?.data;
    if (!data || typeof data !== "object") return false;
    let changed = false;
    Object.keys(data).forEach((key) => {
      // custom 前缀模块统一使用 custom 默认模板
      const isCustomModule = key.startsWith("custom");
      const defaultForm = isCustomModule ? allConfig.custom : allConfig[key];
      if (!defaultForm) return;
      // user 模块属于固定配置，其余模块属于可编辑配置
      const targetConfig = key === "user" ? item.fixedConfig : item.config;
      if (!targetConfig || !Array.isArray(targetConfig.fields)) return;
      // user 默认配置为字段数组，其余模块为单条字段
      const defaultFields = Array.isArray(defaultForm) ? defaultForm : [defaultForm];
      defaultFields.forEach((defaultField: any) => {
        const newField = structuredClone(defaultField);
        if (isCustomModule) {
          // custom 模板按实际模块 key 重写，并沿用原有模块标题
          const existField = targetConfig.fields.find((f: any) => f?.key === key);
          rewriteCustomFieldByKey(newField, key, existField?.name || data[key]?.name || "");
        }
        const fieldKey = newField.key;
        if (!fieldKey) return;
        // 数组型模块默认 list 为空，按 data 已有条数补齐子项
        fillArrayListByData(newField, data);
        // 替换同 key 模块为最新默认配置，缺失模块追加到末尾
        const fieldIndex = targetConfig.fields.findIndex((f: any) => f?.key === fieldKey);
        if (fieldIndex > -1) {
          targetConfig.fields[fieldIndex] = newField;
        } else {
          targetConfig.fields.push(newField);
        }
        changed = true;
      });
    });
    return changed;
  };

  return { refreshConfigByData };
}
