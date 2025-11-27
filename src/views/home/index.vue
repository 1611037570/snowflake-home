<template>
  <!-- 背景组件 -->
  <Background> </Background>
  <!-- 菜单组件 -->
  <MenuBar></MenuBar>
  <!-- 搜索组件 -->
  <Search></Search>

  <Transition
    enter-active-class="transition-all duration-300 linear"
    leave-active-class="transition-all duration-300 linear"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <!-- 快捷方式组件 -->
    <Shortcut v-if="tabIndex == 1"></Shortcut>
  </Transition>
  <!-- 文案组件 -->
  <Transition
    enter-active-class="transition-all duration-300 linear"
    leave-active-class="transition-all duration-300 linear"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <Quote v-if="searchFocus"></Quote>
  </Transition>

  <!-- dock组件 -->
  <Dock />
  <!-- 游戏组件 -->
  <Game />
  <!-- 置顶便签组件 -->
  <TopNote />
  <!-- 便签组件 -->
  <Notes />
  <SettingModal />
</template>

<script setup>
import { useHomeStore, useSearchStore, useShortcutStore } from '@/stores'
import { storeToRefs } from 'pinia'

// 基础组件 - 页面加载时需要的组件
import Background from './components/background.vue'
import Dock from './dock/index.vue'
import MenuBar from './menuBar/index.vue'
import Search from './search/index.vue'

// 按需加载组件 - 使用动态导入
const Quote = defineAsyncComponent(() => import('./components/quote.vue'))
const SettingModal = defineAsyncComponent(() => import('./setting/modal.vue'))
const Game = defineAsyncComponent(() => import('./games/index.vue'))
const Shortcut = defineAsyncComponent(() => import('./shortcut/index.vue'))
const TopNote = defineAsyncComponent(() => import('./notes/topNote.vue'))
const Notes = defineAsyncComponent(() => import('./notes/modal.vue'))

const homeStore = useHomeStore()
const { tabIndex } = storeToRefs(homeStore)
const searchStore = useSearchStore()
const { searchFocus } = storeToRefs(searchStore)
const shortcutStore = useShortcutStore()

import { getWeatherData } from '@/services'
getWeatherData('hello').then((res) => {
  console.log('getWeatherData res', res)
})
shortcutStore.initShortcutList()

// getBaiduSearchData('hello', false).then((res) => {
//   console.log('getBaiduSearchData res', res)
// })
</script>
