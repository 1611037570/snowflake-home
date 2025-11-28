import { computed } from 'vue'
// 实现一个创建id的函数 复杂的

// 3. 生成UUID v4风格的ID
function getUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
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
