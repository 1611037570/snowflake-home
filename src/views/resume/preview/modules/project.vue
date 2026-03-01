<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import Content from '../theme/content.vue'
import Title from '../theme/title.vue'
import { getTime } from './utils'

const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)
const projectList = computed(() => currentData.value.project || [])
</script>

<template>
  <div class="flex flex-col">
    <!-- 标题栏 -->
    <Title title="项目经历"></Title>
    <!-- 内容区 -->
    <div v-for="(item, index) in projectList" :key="index" class="mb-3 flex flex-col">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="text-lg font-bold">{{ item.name }}</div>
          <div>{{ item.post }}</div>
        </div>
        <div class="flex items-center">{{ getTime(item.time) }}</div>
      </div>
      <!-- 补充描述/经历 -->
      <Content :content="item.content" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
