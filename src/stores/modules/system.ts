import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { ref } from 'vue'
const start = '2019-11-22'
export const useSystemStore = defineStore(
  'system',
  () => {
    // 项目运行时间
    const runTime = ref<number>(dayjs().diff(dayjs(start), 'day'))
    // 性能监控
    const monitorWatch = ref<boolean>(true)

    return { runTime, monitorWatch }
  },
  {
    persist: {
      storage: localStorage,
      pick: [''],
    },
  },
)
