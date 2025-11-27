<template>
  <div
    class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-[10px] backdrop-blur-md transition-all duration-200"
    @click="openResume"
  >
    写简历
    <indexModal v-if="indexVisible" />
  </div>
</template>

<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { defineAsyncComponent } from 'vue'

// 异步导入模态框组件
const indexModal = defineAsyncComponent(() => import('@/views/resume/indexModal.vue'))

const resumeStore = useResumeStore()
const { indexVisible } = storeToRefs(resumeStore)

const openResume = () => {
  indexVisible.value = true
}
</script>

<style scoped></style>
