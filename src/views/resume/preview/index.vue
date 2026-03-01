<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import ConfigItem from './ConfigItem.vue'
import ResumePage from './page.vue'
import ScaleContainer from './ScaleContainer.vue'

const resumeStore = useResumeStore()
const { currentUI } = storeToRefs(resumeStore)

const paddingList = [
  {
    name: '紧凑',
    value: 'p-3',
  },
  {
    name: '适中',
    value: 'p-6',
  },
  {
    name: '宽松',
    value: 'p-9',
  },
]

const paddingValue = computed(() => paddingList[currentUI.value.paddingIndex].value)

const fontList = [
  {
    name: '小',
    value: 'text-xs',
  },
  {
    name: '中',
    value: 'text-sm',
  },
  {
    name: '大',
    value: 'text-base',
  },
]

const fontValue = computed(() => fontList[currentUI.value.fontIndex].value)

const lineHeightList = [
  {
    name: '紧凑',
    value: 'leading-tight',
  },
  {
    name: '适中',
    value: 'leading-normal',
  },
  {
    name: '宽松',
    value: 'leading-relaxed',
  },
]

const lineHeightValue = computed(() => lineHeightList[currentUI.value.lineHeightIndex].value)
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="z-10 flex flex-col gap-4 border-b border-sf-border bg-white p-4">
      <ConfigItem label="页边距" leftLabel="窄" rightLabel="宽" v-model="currentUI.paddingIndex" />
      <ConfigItem label="字体大小" leftLabel="小" rightLabel="大" v-model="currentUI.fontIndex" />
      <ConfigItem
        label="行间距"
        leftLabel="密"
        rightLabel="疏"
        v-model="currentUI.lineHeightIndex"
      />
    </div>
    <ScaleContainer class="min-h-0 w-full flex-1">
      <ResumePage
        :paddingClass="paddingValue"
        :fontClass="fontValue"
        :lineHeightClass="lineHeightValue"
      />
    </ScaleContainer>
  </div>
</template>

<style scoped></style>
