<script setup>
import { useResumeStore } from '@/stores'
import ResumeModule from './modules/index.vue'

defineOptions({ name: 'ResumePage' })

defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
  workList: {
    type: Object,
    default: () => ({}),
  },
  paddingClass: {
    type: String,
    default: 'p-5',
  },
})

const resumeStore = useResumeStore()
const { currentData, currentConfig } = storeToRefs(resumeStore)
</script>

<template>
  <div
    class="flex h-[1123px] w-[794px] flex-col rounded-lg bg-white text-black"
    :class="paddingClass"
  >
    <div class="flex flex-1 flex-col text-sm">
      <template v-for="item in currentConfig" :key="item.type">
        <ResumeModule :data="currentData" :name="item.type" />
      </template>
    </div>
    <div class="mt-auto text-center text-xs">第 1 页，共 1 页</div>
  </div>
</template>

<style scoped></style>
