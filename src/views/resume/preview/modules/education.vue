<script setup>
import { useResumeStore } from '@/stores'

const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)
const education = computed(() => currentData.value.education || [])
// 校验经历
const hasEducation = (education) => {
  if (education == '<p><br></p>') {
    return
  }
  return true
}
</script>

<template>
  <div class="mb-6 flex flex-col gap-3">
    <!-- 标题栏 -->
    <div class="flex items-center gap-2 border-b border-sf-border pb-1">
      <div class="h-4 w-1 rounded-full bg-sf-theme"></div>
      <h2 class="text-lg font-bold tracking-wide">教育经历</h2>
    </div>

    <!-- 内容区 -->
    <div v-for="(item, index) in education" :key="index" class="flex flex-col gap-1 px-1">
      <div class="flex items-center justify-between">
        <div class="flex items-baseline gap-4">
          <span class="text-base font-bold">{{ item.school }}</span>
          <div class="flex items-center gap-2 text-sm">
            <span>{{ item.degree }}</span>
            <span v-if="item.degree && item.major" class="h-3 w-[1px] bg-sf-border"></span>
            <span>{{ item.major }}</span>
          </div>
        </div>
        <span class="font-mono text-sm font-medium">{{ item.time }}</span>
      </div>
      <!-- 补充描述/经历 -->
      <div v-if="hasEducation(item.experience)" class="text-sf-desc text-sm whitespace-pre-wrap">
        {{ item.experience }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
