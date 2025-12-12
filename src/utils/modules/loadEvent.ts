// 组合键事件与默认行为控制：禁用右键、监听 Ctrl+Z+X+C 切换监控

// 状态管理：系统监控开关
import { useSystemStore } from '@/stores/modules/system'
// 组合键监听
import { useMagicKeys } from '@vueuse/core'

const keys: any = useMagicKeys()
const ctrlZXC = keys['Ctrl+Z+X+C'] // Ctrl+Z+X+C 组合键引用

// 加载默认事件：初始化右键禁用与组合键监听（产生全局副作用）
function loadEvent() {
  const systemStore = useSystemStore()
  const { monitorWatch } = storeToRefs(systemStore)

  // 禁用默认右键菜单
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
  })

  // 监听 Ctrl+Z+X+C 组合键，切换监视开关
  watch(ctrlZXC, (newVal /* 组合键状态 */) => {
    if (!newVal) return
    monitorWatch.value = !monitorWatch.value // 切换监视开关
  })
}
export { loadEvent }
