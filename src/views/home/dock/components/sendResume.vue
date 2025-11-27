<template>
  <div
    class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-[10px] backdrop-blur-md transition-all duration-200"
    @click="sendResume"
  >
    投简历
  </div>
</template>

<script setup>
import { urlNavigation } from '@/utils'
const sendResume = () => {
  urlNavigation('https://www.zhipin.com/')
}
</script>

<style scoped></style>
