import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore(
  'modal',
  () => {
    const modalVisible = ref(false)

    return { modalVisible }
  },
  {
    persist: {
      storage: localStorage,
    },
  },
)
