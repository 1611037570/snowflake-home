/**
 * 系统主题色
 */
export const THEME_COLOR = '#50a2ff'
/**
 * 系统主题色-悬停
 */
export const THEME_COLOR_HOVER = 'oklch(88.2% 0.059 254.128)'
/**
 * 基础页面
 * 用于展示项目的图标、主题样式资源
 */
export const BASE_PAG_LIST = ['messageBoard', 'icon', 'color']
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
 * 包含基础页面和项目页面（路由通过 ALL_PAGE_LIST 配置）
 */
export const ALL_PAGE_LIST = [...BASE_PAG_LIST, ...PROJECT_PAGE_LIST]
/**
 * 默认页面
 */
export const DEFAULT_PAGE = '/home'
