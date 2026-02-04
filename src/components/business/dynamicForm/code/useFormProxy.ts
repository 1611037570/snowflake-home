import { getUUID } from '@/utils'
import { ref, watch } from 'vue'

const useFormProxy = (form: any) => {
  const formProxy = ref()
  watch(
    () => form,
    (newValue) => {
      console.log('newValue:>> ', newValue)

      formProxy.value = newValue.value.map((item: any) => {
        if (item?.id) {
          return item
        }
        return {
          ...item,
          id: item.id || getUUID(),
        }
      })
    },
    { deep: true, immediate: true },
  )

  return formProxy
}
export default useFormProxy
