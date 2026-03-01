<script setup>
import Title from '../theme/title.vue'

import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import Content from '../theme/content.vue'

import { getTime } from './utils'

const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)

const workList = computed(() => currentData.value.work || [])
</script>

<template>
  <div class="flex flex-col">
    <Title title="工作经历" />
    <template v-if="workList.length">
      <template :key="index" v-for="(item, index) in workList">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="text-lg font-bold">{{ item.name }}</div>
            <div>{{ item.post }}</div>
          </div>
          <div class="flex items-center">{{ getTime(item.time) }}</div>
          <!-- 补充描述/经历 -->
        </div>
        <Content :content="item.content" />
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
