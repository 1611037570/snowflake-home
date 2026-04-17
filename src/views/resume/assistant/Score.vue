<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const resumeStore = useResumeStore()
const { currentData } = storeToRefs(resumeStore)

// 计算单个对象得分
function calculateScore(obj) {
  if (!obj) return 0
  const keys = Object.keys(obj)
  const totalFields = keys.length
  if (totalFields === 0) return 0
  const singleScore = 10 / totalFields
  let totalScore = 0

  for (const key of keys) {
    const value = obj[key]
    const hasContent = value != null && String(value).trim() !== ''
    if (hasContent) totalScore += singleScore
  }
  return Math.round(totalScore)
}

// 数组评分函数（完美复用）
function calculateListScore(list) {
  if (!Array.isArray(list) || list.length === 0) return 0
  let totalScore = 0
  for (const item of list) {
    totalScore += calculateScore(item) // 🔥 复用原函数
  }
  const finalScore = totalScore / list.length
  return Math.round(finalScore)
}

// 计算各项得分
const userScore = computed(() => calculateScore(currentData.value?.user || {}))
const educationScore = computed(() => calculateListScore(currentData.value?.education || []))
const skillScore = computed(() => (currentData.value?.skill?.trim() ? 10 : 0))
const workScore = computed(() => calculateListScore(currentData.value?.work || []))
const projectScore = computed(() => calculateListScore(currentData.value?.project || []))

// 雷达图配置
const a = computed(() => ({
  title: {
    text: '能力评估',
  },
  radar: {
    indicator: [
      { name: '用户信息', max: 10 },
      { name: '教育经历', max: 10 },
      { name: '专业技能', max: 10 },
      { name: '工作经历', max: 10 },
      { name: '项目经历', max: 10 },
    ],
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: [
            userScore.value,
            educationScore.value,
            skillScore.value,
            workScore.value,
            projectScore.value,
          ],
          areaStyle: {
            color: 'rgba(54, 162, 235, 0.3)',
          },
          lineStyle: {
            color: 'rgba(54, 162, 235, 1)',
            width: 2,
          },
          itemStyle: {
            color: 'rgba(54, 162, 235, 1)',
          },
        },
      ],
    },
  ],
}))
</script>

<template>
  <div class="flex flex-col">
    <div class="flex h-[400px] w-full items-center justify-center">
      <SfEcharts :options="a" />
    </div>
    <div class="mt-4 space-y-2 rounded-xl bg-white/50 p-4">
      <div class="font-bold">评分详情：</div>
      <div>用户信息评分：{{ userScore }}</div>
      <div>教育经历评分：{{ educationScore }}</div>
      <div>专业技能评分：{{ skillScore }}</div>
      <div>工作经历评分：{{ workScore }}</div>
      <div>项目经历评分：{{ projectScore }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
