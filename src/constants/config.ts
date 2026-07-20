/**
 * 默认语言
 * 系统启动时默认使用的语言
 */
export const DEFAULT_LANGUAGE = import.meta.env.VITE_DEFAULT_LANGUAGE

/**
 * 默认路由地址
 * 系统启动时默认跳转的路由
 */
const currentRoute = localStorage.getItem('snowflakeRoute') || '/init'
export const DEFAULT_ROUTE = currentRoute
/**
 * 外部链接打开方式
 * 系统中所有外部链接的默认打开方式
 */
export const URL_OPEN_TYPE = '_blank'

/**
 * 默认文本颜色
 * 系统中所有组件的默认颜色
 */
export const DEFAULT_COLOR = 'text-sf-base'

/**
 * 默认背景颜色
 * 系统中所有组件的默认背景颜色
 */
export const DEFAULT_BACKGROUND = 'bg-sf-primary'
