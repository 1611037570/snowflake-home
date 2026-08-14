<template>
  <div
    class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-[10px] backdrop-blur-md transition-all duration-200"
    @click="openEmail"
  >
    邮箱
  </div>
</template>

<script setup>
import { urlNavigation } from '@/utils'
const openEmail = () => {
  urlNavigation('https://mail.qq.com/')
}
</script>

<style scoped></style>
