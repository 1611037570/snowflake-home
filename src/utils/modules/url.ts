export function getBaseUrl() {
  const routerMode = import.meta.env.VITE_ROUTER_MODE
  const flag = routerMode === 'hash' ? '#' : ''
  return window.location.origin + flag
}
export function routerNavigation(url: string) {
  if (!url) return
  // 初始化 url 路径
  url = url.startsWith('/') ? url : '/' + url
  const lastUrl = getBaseUrl() + url
  window.open(lastUrl, '_blank')
}
export function urlNavigation(url: string) {
  window.open(url, '_blank')
}
