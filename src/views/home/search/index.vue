<script setup>
import { useHomeStore, useSearchStore } from '@/stores'
import { onClickOutside } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import CurrentTime from './currentTime.vue'
import SearchBefore from './searchBefore.vue'
import SearchInput from './searchInput.vue'
import SearchRecommend from './searchRecommend.vue'
import WebSourceList from './webSourceList.vue'

const searchStore = useSearchStore()
const homeStore = useHomeStore()
const { tabIndex } = storeToRefs(homeStore)

const { searchFocus, expressionsFlag, expressionsResult, expressionsVisible, handleValue } =
  storeToRefs(searchStore)

const translateYClass = computed(() => {
  if (!init.value) {
    return 'translate-y-0'
  }
  return tabIndex.value === 0 ? 'translate-y-34' : 'translate-y-12'
})

const init = ref(false)
setTimeout(() => {
  init.value = true
}, 1)

const searchContainer = useTemplateRef('searchContainer')
onClickOutside(searchContainer, () => {
  console.log('点击了非输入框区域')
  searchFocus.value = false
})
</script>

<template>
  <div
    ref="searchContainer"
    class="search-container group translate fixed left-1/2 z-60 flex -translate-x-1/2 flex-col items-center transition-all duration-300"
    :class="[translateYClass]"
  >
    <CurrentTime />
    <!-- 搜索源下拉菜单（移到最顶层，确保正确层级） -->
    <WebSourceList />

    <!-- 搜索框和按钮 -->
    <SearchInput />
    <!-- 搜索结果/历史区域 -->
    <div
      v-if="searchFocus"
      class="absolute top-full left-0 z-30 mt-3 flex w-[590px] transform flex-col rounded-2xl border border-blue-100 bg-sf-primary p-3 shadow-lg transition-all duration-300"
    >
      <template v-if="expressionsVisible">
        <div class="flex items-center justify-center text-sm">
          <div v-if="expressionsFlag && handleValue" class="text-green-500">
            计算结果：<span class="font-bold">
              {{ expressionsResult }}
            </span>
          </div>
          <template v-else-if="!expressionsFlag && handleValue">
            <span class="font-bold text-red-500">表达式错误</span>
          </template>
          <div v-else class="text-sf-theme">输入公式开始逆转时空吧~</div>
        </div>
      </template>
      <!-- 搜索建议 -->
      <SearchRecommend v-else-if="handleValue" />
      <!-- 搜索历史 -->
      <SearchBefore v-else />
      <div class="mt-3 text-center text-xs">了解搜索框功能</div>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-input__wrapper) {
  background-color: transparent !important;
}
:deep(.el-input__inner) {
  text-align: center !important;
}
</style>
