import { getUUID } from '@/utils'
import { computed } from 'vue'
const useConfigProxy = (config: any) => {
  return computed(() => {
    return config.value.map((item: any) => {
      return {
        ...item,
        id: item.id || getUUID(),
      }
    })
  })
}
export default useConfigProxy
