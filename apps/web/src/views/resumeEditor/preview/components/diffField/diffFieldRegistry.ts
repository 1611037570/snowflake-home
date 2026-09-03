/**
 * diffFieldRegistry —— diff 字段模块级注册表
 *
 * diffField 挂载时把自身代理对象与 html 标记注册到此处，卸载时注销；
 * 预览容器上的悬浮事件委托按 data-field-key 定位字段后从本注册表取数据，
 * 从而不再需要每个字段单独挂鼠标监听。
 */

/** 字段注册条目：model 用 getter 读取，保证委托时始终取最新代理值 */
export interface DiffFieldEntry {
  model: () => any;
  html: boolean;
}

export const diffFieldRegistry = new Map<string, DiffFieldEntry>();