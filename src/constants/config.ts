export const DEFAULT_LANGUAGE = import.meta.env.VITE_DEFAULT_LANGUAGE
/**
 * 系统主题色
 * 用于系统中主要交互元素的主色调
 */
export const THEME_COLOR = '#50a2ff'
/**
 * 系统主题色-悬停状态
 * 用于系统中交互元素的悬停效果
 */
export const THEME_COLOR_HOVER = 'oklch(88.2% 0.059 254.128)'

/**
 * 基础路由列表
 * 包含项目的基础设施
 */
export const BASE_ROUTES = ['messageBoard', 'icon', 'color', 'components', 'data', 'index']
/**
 * 项目路由列表
 * 包含企业级应用项目路由
 */
export const PROJECT_ROUTES = ['image', 'resume', 'home', 'form']
/**
 * 轻量级路由列表
 * 包含简单小游戏和实用工具路由
 */
export const MUSE_ROUTES = [
  '2048',
  'sort',
  'checklist',
  'note',
  'passwordBox',
  'reborn',
  'time',
  'ai',
  'test',
]
/**
 * 基础与项目路由组合列表
 * 包含所有基础路由、项目路由和轻量级路由，用于导航和权限控制
 */
export const ALL_ROUTES = [...BASE_ROUTES, ...PROJECT_ROUTES, ...MUSE_ROUTES]
/**
 * 默认路由地址
 * 系统启动时默认跳转的路由
 */
export const DEFAULT_ROUTE = '/home'
/**
 * 外部链接打开方式
 * 系统中所有外部链接的默认打开方式
 */
export const URL_OPEN_TYPE = '_blank'
