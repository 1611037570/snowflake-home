import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const loginVisible = ref(false)

    return { loginVisible }
  },
  {
    persist: {
      storage: localStorage,
    },
  },
)
