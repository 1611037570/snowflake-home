<template>
  <div class="w-dwh relative z-10 flex flex-col items-center bg-sf-primary p-36" id="project">
    <div
      v-for="(section, idx) in sections"
      :key="idx"
      :class="['w-full max-w-[1200px]', { 'mb-10': idx !== sections.length - 1 }]"
    >
      <div class="mb-3 flex items-center">
        <div class="mr-6 h-[1px] flex-1 bg-gradient-to-l from-sf-border/50 to-transparent"></div>
        <SmallTitle :title="section.title" />
        <div class="ml-6 h-[1px] flex-1 bg-gradient-to-r from-sf-border/50 to-transparent"></div>
      </div>
      <div class="grid grid-cols-2 gap-6">
        <ProjectCard v-for="(item, index) in section.list" :key="index" :data="item" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { PROJECT_PAGE } from '@/constants'
import SmallTitle from '../components/smallTitle.vue'
import ProjectCard from './projectCard.vue'
const list = computed(() => {
  return PROJECT_PAGE.value.filter((item) => {
    if (item.hidden) {
      return false
    }
    if (item.url != '/index') {
      return item
    }
  })
})
// 项目经历数据
const projectList = [
  {
    name: '**社区',
    desc: 'AI驱动的新一代社区平台',
    urlType: 'web',
    // 官网: 'https://osx.aisns.net/',
    // 体验: 'https://h5.opensns.cn/#/',
  },
  {
    name: '**工作台',
    desc: '副屏"操作系统"',
    urlType: 'web',
    // 官网: 'https://www.apps.vip/',
    // 体验: 'https://web.apps.vip/',
  },
]

const sections = computed(() => [
  {
    title: '个人项目',
    list: list.value,
  },
  {
    title: '参与开发',
    list: projectList,
  },
])
</script>
