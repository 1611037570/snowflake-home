<script setup>
import { useResumeStore } from '@/stores'
import { inject } from 'vue'
import ResumeModule from './modules/index.vue'

defineOptions({ name: 'ResumePage' })

const resumeStore = useResumeStore()
const { currentData, currentConfig, currentUI } = storeToRefs(resumeStore)

const paddingValue = inject('paddingValue')
const fontValue = inject('fontValue')
const lineHeightValue = inject('lineHeightValue')
</script>

<template>
  <div
    class="flex h-[1123px] w-[794px] flex-col rounded-lg bg-white text-black shadow-lg"
    :class="currentUI.fontFamily"
    :style="paddingValue()"
  >
    <div class="flex flex-1 flex-col" :style="[fontValue(), lineHeightValue()]">
      <template v-for="item in currentConfig" :key="item.type">
        <ResumeModule :data="currentData" :name="item.type" />
      </template>
    </div>
    <div class="mt-auto text-center text-xs">第 1 页，共 1 页</div>
  </div>
</template>

<style scoped></style>
