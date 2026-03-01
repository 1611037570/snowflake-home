/**
 * 校验对象类型的表单项配置
 * @param form 表单项配置
 */
function checkObjectForm(form: any) {
  const { component, data } = form
  const errors = []
  if (!component) {
    errors.push('component')
  }
  if (!data) {
    errors.push('data')
  } else {
    // const { path, key } = data
    // if (!path) {
    //   errors.push('data.path')
    // }
    // if (!key) {
    //   errors.push('data.key')
    // }
  }

  if (errors.length > 0) {
    return '缺少 ' + errors.join('、 ')
  }
  return true
}

/**
 * 校验数组类型的表单项配置
 * @param form 表单项配置
 */
function checkArrayForm(form: any) {
  const { component, list } = form
  const errors = []
  if (!component) {
    errors.push('component')
  }
  if (!list) {
    errors.push('list')
  } else if (!Array.isArray(list)) {
    errors.push('list 必须是数组')
  }

  if (errors.length > 0) {
    return '缺少 ' + errors.join('、 ')
  }
  return true
}

/**
 * 校验表单项配置的合法性
 * @param form 表单项配置
 */
export function checkForm(form: any) {
  const { type, children } = form
  // 如果有 children，认为是一个容器，校验通过
  if (Array.isArray(children) && children.length > 0) {
    return true
  }
  // 否则必须有类型
  if (!type) {
    return 'type'
  }
  if (type === 'object') {
    return checkObjectForm(form)
  }
  if (type === 'array') {
    return checkArrayForm(form)
  }

  return '未知的 type: ' + type
}
