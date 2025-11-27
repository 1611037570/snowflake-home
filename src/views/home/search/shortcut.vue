<script setup>
import { useSearchStore, useShortcutStore } from '@/stores'
import { getStrMatch } from '@/utils'
import Item from './item.vue'
import SearchTitle from './searchTitle.vue'
const shortcutStore = useShortcutStore()
const searchStore = useSearchStore()
const { shortcutVisible, searchValue, h } = storeToRefs(searchStore)
const { shortcutList } = storeToRefs(shortcutStore)
const { open } = searchStore
// 匹配的快捷键
const matchShortcut = computed(() => {
  // 没有输入内容
  if (!searchValue.value) return []

  // 找到所有匹配的快捷键
  return shortcutList.value.filter((item) => {
    // 名称匹配
    const name = getStrMatch(item.name, searchValue.value)
    if (name) return true
    // 拼音匹配
    const pinyin = getStrMatch(item.pinyin, searchValue.value)
    if (pinyin) return true
  })
})
</script>

<template>
  <SearchTitle
    v-if="shortcutVisible"
    title="快捷方式"
    info="快捷方式已添加的网站链接，支持输入拼音、名称查找。"
    icon="material-symbols:article-shortcut-rounded"
    iconClass=" text-emerald-400"
  />
  <div v-if="matchShortcut.length && shortcutVisible" class="mb-3 flex flex-wrap gap-3">
    <Item v-for="item in matchShortcut" :key="item.name" @click="open(item.url)">
      {{ item.name }}
    </Item>
  </div>
  <div v-else-if="shortcutVisible" class="mb-3 text-center text-sm">暂无匹配的快捷方式</div>
</template>

<style lang="scss" scoped></style>
