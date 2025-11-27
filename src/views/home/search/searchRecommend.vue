<script setup>
import { appSource } from '@/datas/search.data'
import { useSearchStore } from '@/stores'
import { storeToRefs } from 'pinia'
import Item from './item.vue'
import SearchList from './searchList.vue'
import SearchTitle from './searchTitle.vue'
import SearchShortcut from './shortcut.vue'

const searchStore = useSearchStore()
const { search } = searchStore
const { appSourceVisible } = storeToRefs(searchStore)
</script>

<template>
  <SearchShortcut />
  <SearchTitle
    title="外站直达"
    info="通过你输入搜索词直接打开外站搜索。"
    v-if="appSourceVisible"
    icon="fluent:apps-24-filled"
    iconClass="text-pink-300"
  />
  <div class="mb-3 flex flex-wrap gap-3" v-if="appSourceVisible">
    <Item v-for="item in appSource" :key="item.type" @click="search(item)">
      {{ item.type }}
    </Item>
  </div>
  <SearchTitle title="关键词推荐" icon="fluent:align-left-24-filled" iconClass="text-sf-theme" />
  <SearchList :list="appSource" />
</template>

<style scoped></style>
