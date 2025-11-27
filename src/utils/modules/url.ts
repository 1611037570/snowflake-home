export function routerNavigation(url: string) {
  const routerMode = import.meta.env.VITE_ROUTER_MODE
  if (routerMode === 'hash') {
    url = window.location.hash + url
  }
  window.open(url, '_blank')
}
export function urlNavigation(url: string) {
  window.open(url, '_blank')
}
