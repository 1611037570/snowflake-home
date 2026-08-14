<template>
  <div
    class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-[10px] backdrop-blur-md transition-all duration-200"
    @click="openNote"
  >
    密码箱
  </div>
</template>

<script setup>
import { usePasswordStore } from '@/stores/modules/password'
const passwordStore = usePasswordStore()
const { homeModalVisible } = storeToRefs(passwordStore)

const openNote = () => {
  homeModalVisible.value = true
}
</script>

<style scoped></style>
