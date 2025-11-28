import { defineStore } from 'pinia'
import { ref } from 'vue'
import dayjs from 'dayjs'
const start = '2019-11-22'
export const useSystemStore = defineStore(
  'system',
  () => {
    const runTime = ref<number>(dayjs().diff(dayjs(start), 'day'))

    return { runTime }
  },
  {
    persist: {
      storage: localStorage,
      pick: [''],
    },
  },
)
