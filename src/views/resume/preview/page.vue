<script setup>
import Educational from './modules/educational.vue'
import ResumeModule from './modules/index.vue'
import Skill from './modules/skill.vue'

defineOptions({ name: 'ResumePage' })

defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
  workList: {
    type: Object,
    default: () => ({}),
  },
  paddingClass: {
    type: String,
    default: 'p-5',
  },
})
</script>

<template>
  <div
    class="flex h-[1123px] w-[794px] flex-col rounded-lg bg-white text-sf-primary"
    :class="paddingClass"
  >
    <div class="flex flex-1 flex-col text-sm">
      <!-- 信息模块 -->
      <ResumeModule :data="user" name="user" />

      <!-- 教育经历 -->
      <Educational />

      <!-- 专业技能 -->
      <Skill />

      <!-- 工作经历 -->
      <div v-if="workList" class="flex flex-col">
        <div class="mb-3 text-lg font-bold">工作经历</div>
        <div class="mb-3 flex items-center justify-between">
          {{ workList.company }}
          <div class="flex items-center">
            {{ workList.startWorkTime }}-{{ workList.endWorkTime }}
          </div>
        </div>
        <div v-for="item in workList.content" :key="item.time" class="text-[12px]">
          {{ item.time }}：{{ item.content }}
        </div>
      </div>

      <!-- 项目经历 -->
      <div>
        <div class="mb-3 text-lg font-bold">项目经历</div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="text-lg font-bold">短说社区</div>
            <div>前端开发工程师</div>
          </div>
          <div>2023.03-2024.06</div>
        </div>
      </div>
    </div>
    <div class="mt-auto text-center text-xs">第 1 页，共 1 页</div>
  </div>
</template>

<style scoped></style>
