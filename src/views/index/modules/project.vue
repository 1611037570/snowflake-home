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
        <!-- <ProjectCard:data="item" /> -->
        <div
          v-for="(item, index) in list"
          :key="index"
          class="cursor-pointer rounded-xl p-2 transition hover:bg-sf-bg-hover"
        >
          <div class="mb-1 flex items-center font-medium text-sf-base">
            <SfLogo v-if="item.icon" :name="item.icon" :size="5" class="mr-2 shrink-0" />
            <div class="truncate">
              {{ item.name }}
            </div>
          </div>
          <div class="text-sm text-sf-text-2" v-if="item.desc">{{ item.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 参与开发 -->
    <div class="w-full max-w-7xl">
      <div class="mb-8 flex items-center">
        <SmallTitle title="参与开发" />
        <div class="ml-6 h-[1px] flex-1 bg-gradient-to-r from-sf-border/50 to-transparent"></div>
      </div>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div
          v-for="(item, index) in projectList"
          :key="index"
          class="cursor-pointer rounded-xl p-2 transition hover:bg-sf-bg-hover"
        >
          <div class="mb-1 flex items-center font-medium text-sf-base">
            <div class="truncate">
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PROJECT_PAGE } from '@/constants'
import SmallTitle from '../components/smallTitle.vue'
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
    desc: '一款集社区论坛、商城、学堂于一体的社交系统',
    urlType: 'web',
  },
  {
    name: '**工作台',
    desc: '副屏"操作系统"',
  },
]
</script>
