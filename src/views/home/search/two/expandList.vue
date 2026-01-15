<template>
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
</template>

<script setup>
import { useSearchStore } from '@/stores'
import Item from '../item.vue'
import SearchTitle from '../searchTitle.vue'

const searchStore = useSearchStore()
const { search } = searchStore
const { appSourceVisible, appSource } = storeToRefs(searchStore)
</script>

<style lang="scss" scoped></style>
