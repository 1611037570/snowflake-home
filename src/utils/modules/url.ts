export function routerNavigation(url: string) {
  if (!url) return
  // 初始化 url 路径
  url = url.startsWith('/') ? url : '/' + url
  const originUrl = window.location.origin
  const routerMode = import.meta.env.VITE_ROUTER_MODE
  const flag = routerMode === 'hash' ? '#' : ''
  const lastUrl = originUrl + flag + url
  window.open(lastUrl, '_blank')
}
export function urlNavigation(url: string) {
  window.open(url, '_blank')
}
