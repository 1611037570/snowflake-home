/**
 * 系统主题色
 * 用于系统中主要的交互元素
 */
export const THEME_COLOR = '#50a2ff'
/**
 * 系统主题色-悬停
 * 用于系统中交互元素的悬停状态
 */
export const THEME_COLOR_HOVER = 'oklch(88.2% 0.059 254.128)'

/**
 * 基础页面
 * 用于展示项目的图标、主题样式资源
 */
export const BASE_PAG_LIST = ['messageBoard', 'icon', 'color', 'components', 'data']
/**
 * 项目页面
 * 用于加载所需要的项目
 */
export const PROJECT_PAGE_LIST = [
  'image',
  'resume',
  'index',
  'home',
  'reborn',
  '2048',
  'sort',
  'checklist',
  'note',
  'passwordBox',
]
/**
 * 所有页面
 * 用于展示所有项目页面和基础页面
 */
export const ALL_PAGE_LIST = [...BASE_PAG_LIST, ...PROJECT_PAGE_LIST]
/**
 * 默认路由
 */
export const DEFAULT_ROUTE = '/home'
/**
 * 链接打开方式
 */
export const URL_OPEN_TYPE = '_blank'
