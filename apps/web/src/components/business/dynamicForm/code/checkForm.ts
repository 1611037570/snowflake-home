/**
 * 校验对象类型的表单项配置
 * @param form 表单项配置
 */
function checkObjectForm(form: any) {
  const { component, model } = form;
  const errors = [];
  if (!component) {
    errors.push("component");
  }
  if (!model) {
    errors.push("model");
  }

  if (errors.length > 0) {
    return "缺少 " + errors.join("、");
  }
  return true;
}

/**
 * 校验数组类型的表单项配置
 * @param form 表单项配置
 */
function checkArrayForm(form: any) {
  const { itemSchema } = form;
  const errors = [];
  if (!itemSchema) {
    errors.push("itemSchema");
  }

  if (errors.length > 0) {
    return "缺少 " + errors.join("、");
  }
  return true;
}

/**
 * 校验表单项配置的合法性
 * @param form 表单项配置
 */
export function checkForm(form: any) {
  if (!form || typeof form !== "object") return "配置无效";
  const { type, fields } = form;
  // 先按节点类型校验，避免存在 fields 时绕过类型约束
  if (!type) {
    return "缺少 type";
  }
  if (type === "object") {
    return checkObjectForm(form);
  }
  if (type === "group") {
    return Array.isArray(fields) && fields.length > 0 ? true : "缺少 fields";
  }
  if (type === "array") {
    return checkArrayForm(form);
  }

  return "未知的 type: " + type;
}
