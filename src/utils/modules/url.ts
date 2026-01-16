import { DEFAULT_ROUTE, URL_OPEN_TYPE, USER_ROUTE } from '@/constants'

// 获取基础路径
export function getBaseUrl() {
  const routerMode = import.meta.env.VITE_ROUTER_MODE
  const flag = routerMode === 'hash' ? '#' : ''
  return window.location.origin + flag
}
// 默认打开
function baseOpen(url: string) {
  window.open(url, URL_OPEN_TYPE)
}
// 路由跳转
export function routerNavigation(url: string) {
  if (!url) return
  // 初始化 url 路径
  url = url.startsWith('/') ? url : '/' + url
  const lastUrl = getBaseUrl() + url
  baseOpen(lastUrl)
}
// 普通跳转
export function urlNavigation(url: string) {
  baseOpen(url)
}
// 路由跳转-用户路由
export function userNavigation() {
  routerNavigation(USER_ROUTE)
}
// 路由跳转-默认路由
export function defaultNavigation() {
  routerNavigation(DEFAULT_ROUTE)
}
