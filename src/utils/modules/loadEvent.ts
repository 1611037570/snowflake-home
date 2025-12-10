import { useSystemStore } from '@/stores/modules/system'
import { useMagicKeys, whenever } from '@vueuse/core'

const keys: any = useMagicKeys()
// 加载默认事件
function loadEvent() {
  const systemStore = useSystemStore()
  const { monitorWatch } = storeToRefs(systemStore)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault() // 阻止默认右键行为
  })
  whenever(keys.ctrl_space, () => {
    console.log('ctrl_space')
    monitorWatch.value = !monitorWatch.value
  })
}
export { loadEvent }
