import { getUUID } from '@/utils'
const useConfigProxy = (config: any) => {
  const configProxy = ref()
  watch(
    () => config,
    (newValue) => {
      console.log('newValue:>> ', newValue)

      configProxy.value = newValue.value.map((item: any) => {
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

  return configProxy
}
export default useConfigProxy
