<template>
  <div
    class="w-dwh relative z-10 flex min-h-dvh flex-col items-center bg-sf-bg px-4 py-24 md:px-8 lg:px-12"
    id="project"
  >
    <!-- 项目经历 -->
    <div class="mb-20 w-full max-w-7xl">
      <div class="mb-8 flex items-center">
        <SmallTitle title="个人项目" />
        <div class="ml-6 h-[1px] flex-1 bg-gradient-to-r from-sf-border/50 to-transparent"></div>
      </div>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ProjectCard
          v-for="(item, index) in PROJECT_PAGE.filter((item) => item.url != '/index')"
          :key="index"
          :data="item"
        />
      </div>
    </div>

    <!-- 参与开发 -->
    <div class="w-full max-w-7xl">
      <div class="mb-8 flex items-center">
        <SmallTitle title="参与开发" />
        <div class="ml-6 h-[1px] flex-1 bg-gradient-to-r from-sf-border/50 to-transparent"></div>
      </div>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ProjectCard v-for="(item, index) in projectList" :key="index" :data="item" />
      </div>
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
