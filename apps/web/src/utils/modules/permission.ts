// 权限检查函数
import { ALL_ROUTES } from '@/constants'
export function checkPermission(permission: string) {
  // 检查用户是否拥有指定权限
  return ALL_ROUTES.includes({ name: permission })
}

/**
 * 带权限的异步组件加载函数
 * @param {string} permissionStr - 权限标识
 * @param {Function} loader - 原异步组件加载函数（如 () => import('./OrderEdit.vue')）
 * @returns {Component} 带权限控制的异步组件（无权限时返回空组件）
 */
export function permissionAsyncComponent(permission: string, loader: () => Promise<any>) {
  return defineAsyncComponent({
    // 核心：加载前先判断权限，无权限则直接返回空组件，不执行loader
    loader: async () => {
      const hasPermission = checkPermission(permission)
      if (!hasPermission) {
        // 无权限时返回空组件，避免加载目标组件
        return { render: () => null }
      }
      // 有权限时执行原加载逻辑
      return loader()
    },
    // 可选：加载中占位组件
    // loadingComponent: { render: () => '<div>加载中...</div>' },
    // 可选：加载失败占位组件
    // errorComponent: { render: () => '<div>组件加载失败</div>' },
    // delay: 200, // 延迟显示加载组件（毫秒）
  })
}
