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

const projectList = computed(() => currentData.value.project || [])
</script>

<template>
  <!-- 标题栏 -->
  <Title title="项目经历"></Title>
  <!-- 内容区 -->
  <template v-for="item in projectList" :key="item.name">
    <div class="mb-3 flex items-center justify-between" :style="[lineHeightValue(3)]">
      <div class="flex items-center gap-4">
        <div class="font-bold" :style="[fontValue(3)]">{{ item.name }}</div>
        <div>{{ item.post }}</div>
      </div>
      <div class="flex items-center">{{ getTime(item.time) }}</div>
    </div>
    <!-- 补充描述/经历 -->
    <Content :content="item.content" />
  </template>
</template>

<style lang="scss" scoped></style>
