<template>
  <div
    class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-[10px] backdrop-blur-md transition-all duration-200"
    @click="openResume"
  >
    <ResumeLogo size="30" />
  </div>
</template>

<script setup>
import ResumeLogo from '@/views/resumeMain/logo.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const openResume = () => {
  router.push({ name: 'resumeMain' })
}
</script>

<style scoped></style>
