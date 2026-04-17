<script setup>
import Title from '../theme/title.vue'

import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed, inject } from 'vue'
import Content from '../theme/content.vue'

import { getTime } from '../../utils'

const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)

const fontValue = inject('fontValue')
const lineHeightValue = inject('lineHeightValue')

const workList = computed(() => currentData.value.work || [])
</script>

<template>
  <div class="resume-row" data-module="work">
    <Title title="工作经历" />
    <template v-for="(item, index) in workList" :key="index">
      <div class="flex items-center justify-between" :style="[lineHeightValue(3)]">
        <div class="flex items-center gap-4">
          <div class="font-bold" :style="[fontValue(3)]">{{ item.name }}</div>
          <div>{{ item.post }}</div>
        </div>
        <div class="flex items-center">{{ getTime(item.time) }}</div>
      </div>
      <Content :content="item.content" />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
