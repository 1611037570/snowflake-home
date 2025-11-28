<script setup>
import { useSearchStore } from '@/stores'
import { storeToRefs } from 'pinia'
import FixedList from './fixedList.vue'
import Item from './item.vue'
import SearchList from './searchList.vue'
import SearchTitle from './searchTitle.vue'

const searchStore = useSearchStore()
const { searchHistory, searchHistoryVisible, openMode, hotSource, hotSourceVisible } =
  storeToRefs(searchStore)
const openHistory = (item) => {
  window.open(item.url, openMode.value)
}

const removeHistory = (index) => {
  searchStore.removeSearchHistory(index)
}
// 清空搜索历史
const clearHistory = () => {
  searchStore.clearSearchHistory()
}

const hotList = [
  {
    name: '百度',
    value: '百度',
  },
  {
    name: '抖音',
    value: '抖音',
  },
  {
    name: '微博',
    value: '微博',
  },
]
function open() {
  window.open('https://gushitong.baidu.com/index/ab-000001', openMode.value)
}
</script>

<template>
  <FixedList />
  <SearchTitle title="市场行情" icon="tabler:history" iconClass="text-sf-theme" />

  <div class="flex gap-3 pb-2">
    <!-- 上证指数卡片 -->
    <div
      @click="open"
      style="background: rgb(245 247 250)"
      class="flex-1 cursor-pointer rounded-lg border border-neutral-100 p-3 shadow-sm transition-all duration-200 hover:border-sf-theme/30 hover:shadow-md"
    >
      <div class="mb-2 flex items-center justify-between">
        <h3 class="flex items-center text-sm font-medium text-sf-text">
          <SfIcon icon="fa-solid:chart-line" class="mr-1.5 text-sf-theme" size="3.5" />
          <span>上证指数</span>
        </h3>
        <span class="rounded-full bg-sf-theme/5 px-2 py-0.5 text-[10px] font-medium text-sf-theme"
          >实时</span
        >
      </div>
      <div class="mb-0.5 flex items-end justify-between">
        <span class="text-[clamp(1rem,2vw,1.25rem)] font-bold text-sf-text" id="sh-index"
          >3,085.67</span
        >
        <span
          class="text-danger flex items-center text-xs font-medium transition-transform hover:scale-105"
        >
          <SfIcon icon="fa-solid:caret-down" class="mr-1" size="2.5" />
          <span>0.07%</span>
        </span>
      </div>
      <p class="text-sf-text-secondary text-xs">+37.82 · 成交量 2.83亿</p>
    </div>

    <!-- 深证成指卡片 -->
    <div
      class="flex-1 cursor-pointer rounded-lg border border-neutral-100 bg-white p-3 shadow-sm transition-all duration-200 hover:border-sf-theme/30 hover:shadow-md"
    >
      <div class="mb-2 flex items-center justify-between">
        <h3 class="flex items-center text-sm font-medium text-sf-text">
          <SfIcon icon="fa-solid:chart-line" class="mr-1.5 text-sf-theme" size="3.5" />
          <span>深证成指</span>
        </h3>
        <span class="rounded-full bg-sf-theme/5 px-2 py-0.5 text-[10px] font-medium text-sf-theme"
          >实时</span
        >
      </div>
      <div class="mb-0.5 flex items-end justify-between">
        <span class="text-[clamp(1rem,2vw,1.25rem)] font-bold text-sf-text" id="sz-index"
          >10,123.45</span
        >
        <span
          class="text-success flex items-center text-xs font-medium transition-transform hover:scale-105"
        >
          <SfIcon icon="fa-solid:caret-up" class="mr-1" size="2.5" />
          <span>0.15%</span>
        </span>
      </div>
      <p class="text-sf-text-secondary text-xs">+42.18 · 成交量 3.65亿</p>
    </div>
  </div>
  <template v-if="searchHistoryVisible && searchHistory.length">
    <search-title title="搜索历史" icon="tabler:history" iconClass="text-sf-theme">
      <template #right>
        <div @click.stop="clearHistory" class="flex items-center">
          <SfIcon icon="material-symbols:delete-outline" class="mr-1.5" size="4" />
          清空全部
        </div>
      </template>
    </search-title>
    <div class="mb-3 flex flex-wrap gap-2">
      <Item @click="openHistory(item)" v-for="(item, index) in searchHistory" :key="index">
        <div class="flex-1 overflow-hidden text-ellipsis text-sf-text">
          {{ item.value }}
        </div>

        <template #right>
          <SfIcon
            icon="formkit:close"
            class="ml-1.5 hover:text-red-500"
            size="4"
            @click.stop="removeHistory(index)"
          />
        </template>
      </Item>
    </div>
  </template>

  <SearchTitle title="热门搜索" icon="bxs:hot" iconClass="text-red-400" v-if="hotSourceVisible">
    <template #right>
      <SfTab :list="hotList" v-model="hotSource" />
    </template>
  </SearchTitle>
  <SearchList v-if="hotSourceVisible" />
</template>

<style scoped>
/* Tailwind CSS is used for styling */
</style>
