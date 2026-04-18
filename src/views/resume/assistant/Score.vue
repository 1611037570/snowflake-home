<script setup>
import { userScore, educationScore, skillScore, workScore, projectScore } from '../utils'

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
