<template>
  <search-title
    title="搜索历史"
    icon="tabler:history"
    iconClass="text-sf-theme"
    v-if="searchHistoryVisible && searchHistory.length"
  >
    <template #right>
      <div @click.stop="clearHistory" class="flex items-center">
        <SfIcon icon="ic:round-delete" class="mr-1.5" size="4" />
        清空全部
      </div>
    </template>
  </search-title>
  <div class="mb-3 flex flex-wrap gap-2" v-if="searchHistoryVisible && searchHistory.length">
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

<script setup>
import { useSearchStore } from '@/stores'
import Item from '../item.vue'
import SearchTitle from '../searchTitle.vue'

const searchStore = useSearchStore()
const { searchHistory, searchHistoryVisible, openMode } = storeToRefs(searchStore)
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
</script>

<style lang="scss" scoped></style>
