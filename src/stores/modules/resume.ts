import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useResumeStore = defineStore(
  'resume',
  () => {
    const indexVisible = ref(false)

    const list = ref([])

    return { indexVisible, list }
  },
  {
    persist: {
      pick: ['list'],
    },
  },
)
