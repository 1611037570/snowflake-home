import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore(
  'game',
  () => {
    const fishCount = ref(0)

    return { fishCount }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['fishCount'],
    },
  },
)
