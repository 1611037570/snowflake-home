// 富文本空值：兼容编辑器空段落与模板、导入数据中的多种空形态
export const isContentEmpty = (val: any): boolean => {
  if (typeof val !== "string") return true;
  // 去掉全部标签与占位空格后无文本即为空
  return (
    val
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim() === ""
  );
};

// Evaluate whether one field contains data that can be rendered.
const hasValidValue = (key: string, rawValue: any): boolean => {
  if (key === "content") return !isContentEmpty(rawValue);
  if (key === "link" && rawValue && typeof rawValue === "object") {
    return Boolean(rawValue.name?.trim?.() || rawValue.url?.trim?.());
  }
  if (Array.isArray(rawValue)) return rawValue.some((item) => hasValidValue("", item));
  if (typeof rawValue === "string") return rawValue.trim() !== "";
  return false;
};

// 业务内容至少包含一个可渲染字段时才展示
const isValidData = (data: any): boolean => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  return Object.entries(data).some(([key, value]) => hasValidValue(key, value));
};

// 数组记录过滤展示状态后只向预览组件传递业务 data
export const getValidData = (data: any) => {
  if (Array.isArray(data)) {
    return data
      .filter((record) => record?.ui?.hidden !== true && isValidData(record?.data))
      .map((record) => record.data);
  }
  return isValidData(data) ? data : null;
};
