import { allConfig, DEFAULT_USER_FORM } from "../formConfig";
import { createUserCustomField, isUserCustomFieldKey } from "./useUserCustomField";

// 自定义模块：按实际 key 重写模板，标题取自模块 ui
function rewriteCustomFieldByKey(field: any, customKey: string, customTitle: string) {
  field.key = customKey;
  // 自定义模块通过上下文绑定实际数据节点
  field.context = [customKey];
  field.model?.forEach((item: any) => {
    if (item.prop === "title") {
      item.defaultValue = customTitle;
    }
  });
}

// 模板注册表：user 与其它预设模块统一从默认配置展开
export function getModuleTemplate(key: string) {
  if (key === "user") return DEFAULT_USER_FORM[0];
  if (key.startsWith("custom_")) return allConfig.custom;
  return (allConfig as Record<string, any>)[key];
}

// 持久化字段列表展开为可渲染的完整 schema
export function expandConfigFields(fields: any[], data: any) {
  const expanded = fields.map((item: any) => {
    const template = getModuleTemplate(item.key);
    if (!template) return item;
    const field = structuredClone(template);
    if (String(item.key).startsWith("custom_")) {
      const customTitle = data?.[item.key]?.ui?.title || "";
      rewriteCustomFieldByKey(field, item.key, customTitle);
    }
    appendUserCustomFields(field, item);
    restoreFieldOrder(field, item);
    placeUserSubtitle(field);
    return field;
  });
  ensureRuntimeFieldIds(expanded);
  return expanded;
}

// 按字段路径提前生成运行时标识，避免渲染完成后再随机补充 id
export function ensureRuntimeFieldIds(fields: any[], parentPath: string[] = []) {
  const occurrences = new Map<string, number>();
  fields.forEach((field: any, index: number) => {
    if (!field || typeof field !== "object") return;
    const binding = Array.isArray(field.model) ? field.model[0] : field.model;
    const source = Array.isArray(binding?.source) ? binding.source.join("-") : "";
    const base = String(field.key || `${field.type || "field"}-${source || index}`).replace(
      /[^a-zA-Z0-9_-]/g,
      "_",
    );
    const occurrence = occurrences.get(base) || 0;
    occurrences.set(base, occurrence + 1);
    const pathKey = occurrence ? `${base}-${occurrence}` : base;
    if (!field.id) field.id = `df-${[...parentPath, pathKey].join("-")}`;
    const childPath = [...parentPath, pathKey];
    if (Array.isArray(field.fields)) ensureRuntimeFieldIds(field.fields, childPath);
    if (field.itemSchema) ensureRuntimeFieldIds([field.itemSchema], [...childPath, "item"]);
  });
  return fields;
}

// 副标题分区固定跟随姓名之后：模板新增的分区不能按"追加到末尾"的默认规则落位
function placeUserSubtitle(field: any) {
  if (field?.key !== "user") return;
  const fields = field.fields ?? [];
  const subtitleIndex = fields.findIndex((item: any) => item?.key === "subtitle");
  const nameIndex = fields.findIndex((item: any) => item?.key === "name");
  if (subtitleIndex < 0 || nameIndex < 0 || subtitleIndex === nameIndex + 1) return;

  const [subtitle] = fields.splice(subtitleIndex, 1);
  fields.splice(nameIndex + 1, 0, subtitle);
}

// 自定义个人字段仅持久化 key 与标题，展开时补全为可渲染配置
function appendUserCustomFields(field: any, persisted: any) {
  if (field?.key !== "user") return;

  // 自定义字段可能位于更多分区或副标题分区，按所在容器分别恢复
  ["more", "subtitle"].forEach((boxKey) => {
    const box = field.fields?.find((item: any) => item?.key === boxKey);
    const persistedBox = persisted?.fields?.find((item: any) => item?.key === boxKey);
    if (!box || !Array.isArray(persistedBox?.fields)) return;

    persistedBox.fields
      .filter((item: any) => isUserCustomFieldKey(item?.key))
      .forEach((item: any) => {
        box.fields.push(createUserCustomField(item.key, item.label || "自定义字段"));
      });
  });
}

// 包含可拖拽子项的容器需要保留嵌套字段顺序
function hasSortableFields(field: any) {
  return (
    field?.drag === true || (Array.isArray(field?.fields) && field.fields.some(hasSortableFields))
  );
}

// 可渲染配置压缩为持久化字段列表：只保留模块 key 与顺序
export function compactConfigFields(fields: any[], parentKey?: string) {
  return fields.map((field: any) => {
    const compactField: any = { key: field.key };
    if (
      (parentKey === "more" || parentKey === "subtitle") &&
      isUserCustomFieldKey(field.key)
    ) {
      // 标题保存在包裹组配置上
      compactField.label = field.props.label;
    }
    if (Array.isArray(field.fields) && hasSortableFields(field)) {
      compactField.fields = compactConfigFields(field.fields, field.key);
    }
    return compactField;
  });
}

// 按稳定 key 恢复可排序容器的子字段顺序，新增字段保留在末尾
function restoreFieldOrder(field: any, persisted: any) {
  if (!Array.isArray(field?.fields) || !Array.isArray(persisted?.fields)) return;

  const fieldMap = new Map(field.fields.map((item: any) => [item.key, item]));
  const ordered: any[] = [];
  const used = new Set<any>();
  persisted.fields.forEach((item: any) => {
    const child = fieldMap.get(item?.key);
    if (!child || used.has(child)) return;
    ordered.push(child);
    used.add(child);
  });
  field.fields.forEach((child: any) => {
    if (!used.has(child)) ordered.push(child);
  });
  field.fields = ordered;

  ordered.forEach((child: any) => {
    const persistedChild = persisted.fields.find((item: any) => item?.key === child.key);
    restoreFieldOrder(child, persistedChild);
  });
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
