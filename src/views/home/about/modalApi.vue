<template>
  <div class="mx-auto max-w-2xl p-6">
    <!-- 页面标题 -->
    <h3 class="mb-6 text-center text-xl font-semibold text-blue-600">API服务支持</h3>

    <!-- 描述信息 -->
    <div class="mb-8 text-center text-gray-600">
      以下是项目使用的API服务，点击服务名称或功能标签可查看详细文档
    </div>

    <!-- API服务卡片列表 -->
    <div class="space-y-6">
      <div
        v-for="item in apiList"
        :key="item.name"
        class="group overflow-hidden rounded-xl border border-blue-50 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg"
      >
        <!-- 背景装饰元素 -->
        <div
          class="absolute -top-12 -right-12 -z-10 h-48 w-48 rounded-full bg-blue-50 opacity-50 transition-transform duration-500 group-hover:scale-110"
        ></div>

        <!-- API服务标题 -->
        <div
          class="flex cursor-pointer items-center gap-2 text-lg font-semibold text-blue-600 transition-all duration-200 hover:text-blue-700"
          @click="openApi(item.url)"
        >
          {{ item.name }}
          <span
            class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600 opacity-0 transition-all duration-200 group-hover:opacity-100"
            >查看文档</span
          >
        </div>

        <!-- API功能标签列表 -->
        <div class="mt-5 flex flex-wrap gap-3">
          <span
            v-for="support in item.support"
            :key="support.name"
            class="group flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700 transition-all duration-200 hover:bg-blue-100"
            @click="openApi(support.url)"
          >
            {{ support.name }}
            <svg
              class="h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { urlNavigation } from '@/utils'

// API服务列表数据
const apiList = [
  {
    name: '虚拟机',
    url: 'https://www.3v.do/',
  },
  {
    name: 'roll',
    url: 'https://www.mxnzp.com/doc/list',
    support: [
      {
        name: 'IP信息',
        url: 'https://www.mxnzp.com/doc/detail?id=4',
      },
      {
        name: '天气',
        url: 'https://www.mxnzp.com/doc/detail?id=7',
      },
    ],
  },
  {
    name: '夏柔',
    url: 'https://api.aa1.cn/',
    support: [
      {
        name: '百度关键词',
        url: 'https://api.aa1.cn/doc/baidu-search.html',
      },
    ],
  },
  {
    name: 'Kairoi',
    url: 'https://api.logoi.cn/',
    support: [
      {
        name: '聚合搜索',
        url: 'https://api.logoi.cn/doc/hotlist',
      },
    ],
  },
]

/**
 * 打开API链接
 * @param {string} url - API服务地址
 */
const openApi = (url) => {
  urlNavigation(url)
}
</script>

<style scoped></style>
