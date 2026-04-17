<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, inject } from 'vue'
import Content from '../theme/content.vue'
import Title from '../theme/title.vue'

import { getTime } from './utils'

const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)

const fontValue = inject('fontValue')
const lineHeightValue = inject('lineHeightValue')
const education = computed(() => {
  return (currentData.value.education || []).map((item) => ({
    ...item,
    infoList: [item.post, item.education, item.mode].filter(
      (v) => v && typeof v === 'string' && v.trim(),
    ),
  }))
})
</script>

<template>
  <!-- 标题栏 -->
  <Title title="教育经历"></Title>
  <!-- 内容区 -->
  <template v-for="(item, index) in education" :key="index">
    <div class="mt-2 flex items-center justify-between" :style="[lineHeightValue(3)]">
      <div class="flex items-baseline gap-4">
        <span class="font-bold" :style="[fontValue(3)]">{{ item.name }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span>{{ getTime(item.time) }}</span>
      </div>
    </div>
    <div class="mt-1 flex items-center gap-2">
      <template v-for="(field, i) in item.infoList" :key="i">
        <span>{{ field }}</span>
        <div v-if="i < item.infoList.length - 1" class="h-1 w-1 rounded-full bg-black"></div>
      </template>
    </div>
    <!-- 补充描述/经历 -->
    <Content :content="item.content" />
  </template>
</template>

<style lang="scss" scoped></style>
