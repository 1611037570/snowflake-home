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
  } else {
    // const { path, key } = model
    // if (!path) {
    //   errors.push('model.path')
    // }
    // if (!key) {
    //   errors.push('model.key')
    // }
  }

  if (errors.length > 0) {
    return "缺少 " + errors.join("、 ");
  }
  return true;
}

/**
 * 校验数组类型的表单项配置
 * @param form 表单项配置
 */
function checkArrayForm(form: any) {
  const { component, list } = form;
  const errors = [];
  if (!component) {
    errors.push("component");
  }
  if (!list) {
    errors.push("list");
  } else if (!Array.isArray(list)) {
    errors.push("list 必须是数组");
  }

  if (errors.length > 0) {
    return "缺少 " + errors.join("、 ");
  }
  return true;
}

/**
 * 校验表单项配置的合法性
 * @param form 表单项配置
 */
export function checkForm(form: any) {
  const { type, fields } = form;
  // 如果有 children，认为是一个容器，校验通过
  if (Array.isArray(fields) && fields.length > 0) {
    return true;
  }
  // 否则必须有类型
  if (!type) {
    return "type";
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
