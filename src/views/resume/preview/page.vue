<script setup>
import { useResumeStore } from '@/stores'
import { inject } from 'vue'
import ResumeModule from './modules/index.vue'

defineOptions({ name: 'ResumePage' })

const resumeStore = useResumeStore()
const { currentData, currentConfig, currentUI, currentFixedConfig } = storeToRefs(resumeStore)

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
      <!-- 用户配置（不参与排序和删除） -->
      <template v-for="item in currentFixedConfig.fields" :key="item.key">
        <ResumeModule :data="currentData" :name="item.key" />
      </template>
      <!-- 其他配置（参与排序和删除） -->
      <template v-for="item in currentConfig.fields" :key="item.key">
        <ResumeModule :data="currentData" :name="item.key" />
      </template>
    </div>
    <div class="mt-auto text-center text-xs">第 1 页，共 1 页</div>
  </div>
</template>

<style scoped></style>
