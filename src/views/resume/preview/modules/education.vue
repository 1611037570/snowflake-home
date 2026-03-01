<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import Content from '../theme/content.vue'
import Title from '../theme/title.vue'

import { getTime } from './utils'

const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)
const education = computed(() => currentData.value.education || [])
</script>

<template>
  <div class="flex flex-col">
    <!-- 标题栏 -->
    <Title title="教育经历"></Title>
    <!-- 内容区 -->
    <div v-for="(item, index) in education" :key="index" class="mb-3">
      <div class="flex items-center justify-between">
        <div class="flex items-baseline gap-4">
          <span class="text-base font-bold">{{ item.name }}</span>
          <span>
            {{ item.education }}
          </span>
          <span>{{ item.post }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <span>{{ getTime(item.time) }}</span>
        </div>
      </div>
      <!-- 补充描述/经历 -->
      <Content :content="item.content" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
