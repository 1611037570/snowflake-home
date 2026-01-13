import { useWindowSize } from '@vueuse/core'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { ref } from 'vue'
const start = '2020-09-03'
export const useSystemStore = defineStore(
  'system',
  () => {
    // 项目运行时间
    const runTime = ref<number>(dayjs().diff(dayjs(start), 'day'))
    // 性能监控
    const monitorWatch = ref<boolean>(false)
    // 窗口大小
    const windowSize = ref<{
      width: number | unknown
      height: number | unknown
    }>({
      width: window.innerWidth,
      height: window.innerHeight,
    })
    function updateWindowSize() {
      windowSize.value = useWindowSize()
    }

    return { runTime, monitorWatch, windowSize, updateWindowSize }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['monitorWatch'],
    },
  },
)
