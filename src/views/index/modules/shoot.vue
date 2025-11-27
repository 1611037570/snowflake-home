<template>
  <!-- 摄影社交平台 -->
  <div class="w-dwh flex-c min-h-dvh flex-col bg-amber-700">
    <h4 class="group mb-3 flex items-center justify-center text-base font-medium text-sf-text">
      <SfIcon
        icon="lucide:camera"
        class="mr-2 h-4 w-4 text-sf-theme transition-transform duration-300 group-hover:scale-110"
      />
      摄影作品分享
    </h4>

    <p class="mb-2 text-center text-sm text-sf-text-2">2023年6月3号 - 至今</p>
    <p class="mb-3 text-center text-sm text-sf-text-2">旅拍城市</p>

    <!-- 城市列表：增强动画 -->
    <div class="mb-4 flex flex-wrap justify-center gap-2">
      <span
        v-for="item in city"
        :key="item.name"
        class="rounded-full bg-sf-theme/5 px-2.5 py-1 text-sm text-sf-theme transition-all duration-200 hover:scale-105 hover:bg-sf-theme/15"
      >
        {{ item.name }}
      </span>
    </div>

    <!-- 摄影平台链接 -->
    <div>全部摄影作品</div>
    <div class="grid grid-cols-2 gap-3">
      <a
        v-for="(item, index) in shoot.list"
        :key="index"
        @click.prevent="urlNavigation(item.url)"
        class="group relative flex overflow-hidden rounded-xl border border-sf-theme-hover/20 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sf-theme/30 hover:bg-sf-theme/5 hover:shadow-md"
      >
        <SfIcon
          :icon="index === 0 ? 'simple-icons:xiaohongshu' : 'simple-icons:tiktok'"
          class="mr-3 h-5 w-5 text-sf-theme transition-all duration-300 group-hover:scale-110"
        />
        <span
          class="text-sm font-medium text-sf-text transition-colors duration-300 group-hover:text-sf-theme"
          >{{ item.name }}</span
        >
        <div
          class="absolute inset-0 bg-gradient-to-r from-sf-theme/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        ></div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { urlNavigation } from '@/utils'
const shoot = {
  name: '摄影',
  list: [
    {
      name: '小红书',
      url: 'https://www.xiaohongshu.com/user/profile/6772591e00000000180175f9',
    },
    {
      name: '抖音',
      url: 'https://www.douyin.com/user/MS4wLjABAAAA2ZiMi4shkb1NyOFV-2DhkMCEUirye08iiO5tO1gq6a5RHwszFi_OdZ_ssU0B3N-u?from_tab_name=main',
    },
  ],
}
const city = [
  {
    name: '杭州',
  },
  {
    name: '嘉兴',
  },
  {
    name: '绍兴',
  },
  {
    name: '上海',
  },
  {
    name: '苏州',
  },
  {
    name: '贵阳',
  },
  {
    name: '福州',
  },
  {
    name: '平潭',
  },
  {
    name: '柳州',
  },
]
</script>
