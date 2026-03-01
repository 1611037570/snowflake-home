import { getAllComponent } from '@/components'
import { inject } from 'vue'

// 获取全局基础/业务组件
const { components: globalComponents } = getAllComponent()

/**
 * 获取组件定义 (支持实例级别注入)
 */
export const getComponent = (name: string) => {
  if (!name) return

  // 1. 优先从实例注入的组件库中查找 (SfDynamicForm 传入的 components prop)
  const instanceComponents = inject<Record<string, any>>('instanceComponents', {})
  if (instanceComponents[name]) {
    return instanceComponents[name]
  }
  // 3. 查找全局自动扫描到的组件 (SfBase/SfBusiness 等)
  const globalComp = globalComponents[name]
  if (globalComp) {
    return globalComp.component
  }

  // 4. 兜底处理：如果都没找到，返回 null 并警告
  console.warn(`[DynamicForm] 组件 "${name}" 未在实例、注册表或全局库中找到。`)
  return null
}
