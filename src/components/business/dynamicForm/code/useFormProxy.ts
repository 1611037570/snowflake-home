import { getUUID } from '@/utils'
import { ref, watch } from 'vue'

const useFormProxy = (form: any) => {
  const formProxy = ref()

  const processItems = (items: any[]) => {
    return items.map((item: any) => {
      const newItem = {
        ...item,
        id: item.id || getUUID(),
      }
      if (Array.isArray(newItem.children)) {
        newItem.children = processItems(newItem.children)
      }
      return newItem
    })
  }

  watch(
    () => form,
    (newValue) => {
      if (newValue?.value) {
        formProxy.value = processItems(newValue.value)
      }
    },
    { deep: true, immediate: true },
  )

  return formProxy
}
export default useFormProxy
