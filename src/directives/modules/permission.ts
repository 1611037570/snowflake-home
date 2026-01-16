import { checkPermission } from '@/utils'

// 权限指令实现
const permission = {
  mounted(el, binding) {
    const { value } = binding
    // 假设有一个全局的权限列表
    const permissions = ['admin', 'editor', 'viewer']

    // 检查当前用户是否有权限
    const hasPermission = checkPermission(value)

    if (!hasPermission) {
      // 没有权限：移除元素
      el.parentNode && el.parentNode.removeChild(el)
    }
  },
}
