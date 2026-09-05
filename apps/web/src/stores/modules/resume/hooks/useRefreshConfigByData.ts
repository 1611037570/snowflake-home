import { allConfig } from "../formConfig";

// 忽略数组 list 与运行时 id，生成模块结构指纹用于判断是否已是最新默认配置
const fieldSchemaFingerprint = (field: any): string => {
  if (Array.isArray(field)) {
    return `[${field.map(fieldSchemaFingerprint).join(",")}]`;
  }
  if (field instanceof RegExp) {
    return `/${field.source}/${field.flags}`;
  }
  if (field && typeof field === "object") {
    return `{${Object.entries(field)
      .filter(([key]) => key !== "list" && key !== "id")
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, value]) => `${JSON.stringify(key)}:${fieldSchemaFingerprint(value)}`)
      .join(",")}}`;
  }
  return JSON.stringify(field);
};

// 默认模板指纹缓存：避免每次进入编辑器重复序列化
const defaultFieldFingerprints = new WeakMap<any, string>();
const getDefaultFingerprint = (field: any): string => {
  let fingerprint = defaultFieldFingerprints.get(field);
  if (!fingerprint) {
    fingerprint = fieldSchemaFingerprint(field);
    defaultFieldFingerprints.set(field, fingerprint);
  }
  return fingerprint;
};

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
  let changed = false;
  while (arrayField.list.length < count) {
    arrayField.list.push(structuredClone(arrayField.addConfig));
    changed = true;
  }
  return changed;
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
        // custom 模板需先按实际 key 重写，用于与现有模块比较及重建
        let templateField = defaultField;
        if (isCustomModule) {
          const existField = targetConfig.fields.find((f: any) => f?.key === key);
          templateField = structuredClone(defaultField);
          rewriteCustomFieldByKey(templateField, key, existField?.name || data[key]?.name || "");
        }
        const fieldKey = templateField.key;
        if (!fieldKey) return;
        const fieldIndex = targetConfig.fields.findIndex((f: any) => f?.key === fieldKey);
        // 已有同结构模块时仅按 data 补齐缺失子项，避免全量重建
        if (
          fieldIndex > -1 &&
          getDefaultFingerprint(templateField) === fieldSchemaFingerprint(targetConfig.fields[fieldIndex])
        ) {
          if (fillArrayListByData(targetConfig.fields[fieldIndex], data)) changed = true;
          return;
        }
        // custom 模板已独立克隆可直接复用，其余模块克隆默认配置避免共享引用
        const newField = isCustomModule ? templateField : structuredClone(templateField);
        // 数组型模块默认 list 为空，按 data 已有条数补齐子项
        fillArrayListByData(newField, data);
        // 替换同 key 模块为最新默认配置，缺失模块追加到末尾
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
