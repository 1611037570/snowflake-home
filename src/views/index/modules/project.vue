<template>
  <div class="w-dwh flex-c relative z-10 min-h-dvh flex-col bg-sf-bg py-24" id="project">
    <!-- 项目经历 -->
    <SmallTitle title="个人项目" />
    <div class="grid grid-cols-2 gap-6">
      <ProjectCard v-for="(item, index) in PROJECT_PAGE" :key="index" :data="item" />
    </div>
    <SmallTitle title="参与开发" />
    <div class="grid grid-cols-2 gap-6">
      <ProjectCard v-for="(item, index) in projectList" :key="index" :data="item" />
    </div>
  </div>
</template>

<script setup>
import { PROJECT_PAGE } from '@/constants'
import ProjectCard from '../components/projectCard.vue'
import SmallTitle from '../components/smallTitle.vue'

// 项目经历数据
const projectList = [
  {
    name: '短说社区',
    url: 'https://osx.opensns.cn/',
    desc: '一款集社区论坛、商城、学堂于一体的社交系统',
    urlType: 'web',
  },
  {
    name: '天天工作台',
    url: 'https://www.apps.vip/',
    desc: '副屏"操作系统"',
  },
]
</script>
