<template>
  <div class="w-dwh flex-c min-h-dvh flex-col bg-amber-400">
    <!-- 技术社交平台 -->
    <section class="mb-8">
      <h4 class="group mb-3 flex items-center text-base font-medium text-sf-text">
        <SfIcon
          icon="lucide:code"
          class="mr-2 h-4 w-4 text-sf-primary transition-transform duration-300 group-hover:rotate-6"
        />
        技术平台
      </h4>
      <div class="grid grid-cols-2 gap-3">
        <a
          v-for="(item, index) in tech.list"
          :key="index"
          @click.prevent="urlNavigation(item.url)"
          class="group relative flex overflow-hidden rounded-xl border border-sf-primary-hover/20 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sf-primary/30 hover:bg-sf-primary/5 hover:shadow-md"
        >
          <SfIcon
            :icon="index === 0 ? 'simple-icons:juejin' : 'simple-icons:github'"
            class="mr-3 h-5 w-5 text-sf-primary transition-all duration-300 group-hover:scale-110"
          />
          <span
            class="text-sm font-medium text-sf-text transition-colors duration-300 group-hover:text-sf-primary"
            >{{ item.name }}</span
          >
          <div
            class="absolute inset-0 bg-gradient-to-r from-sf-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          ></div>
        </a>
      </div>
    </section>

    <!-- 项目经历 -->
    <SmallTitle title="个人项目" />
    <div class="grid grid-cols-2 gap-6">
      <ProjectCard v-for="(item, index) in pageList" :key="index" :data="item" />
    </div>
    <SmallTitle title="参与开发" />
    <div class="grid grid-cols-2 gap-6">
      <ProjectCard v-for="(item, index) in projectList" :key="index" :data="item" />
    </div>
  </div>
</template>

<script setup>
import { pageList } from '@/datas/page.data'
import { urlNavigation } from '@/utils'
import ProjectCard from '../components/projectCard.vue'
import SmallTitle from '../components/smallTitle.vue'
// 社交媒体数据
const tech = {
  name: '技术',
  list: [
    {
      name: '稀土掘金',
      url: 'https://juejin.cn/user/2342386827791687/posts',
    },
    {
      name: 'GitHub',
      url: 'https://github.com/1611037570',
    },
  ],
}

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
