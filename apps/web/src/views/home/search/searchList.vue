<script setup>
import { useSearchStore } from '@/stores'
import { onKeyStroke } from '@vueuse/core'
const searchStore = useSearchStore()
const { searchValue, currentIndex } = storeToRefs(searchStore)

const { list, update } = defineProps({
  list: {
    type: Array,
    default: () => ['123', '456', '789', '012', '345', '678', '901', '234', '567', '890'],
  },
  update: {
    type: Boolean,
    default: false,
  },
})

const style = ['#E63946', '#FB8500', '#FFB703']

const listLength = computed(() => list.length)

// 切换选中项的函数
const setCurrentIndex = (index) => {
  currentIndex.value = index
  if (update) {
    searchValue.value = list[index]
  }
}

// 监听上箭头键
onKeyStroke('ArrowUp', (event) => {
  console.log('event.key', event.key)
  event.preventDefault()
  const newIndex = currentIndex.value <= 0 ? listLength.value - 1 : currentIndex.value - 1
  setCurrentIndex(newIndex)
})

// 监听下箭头键
onKeyStroke('ArrowDown', (event) => {
  console.log('event.key', event.key)
  event.preventDefault()
  let index = currentIndex.value + 1
  if (index >= listLength.value) {
    index = 0
  }
  const newIndex = index
  console.log('newIndex', newIndex)
  setCurrentIndex(newIndex)
})
</script>

<template>
  <div
    v-for="(item, index) in list"
    :key="item"
    class="flex cursor-pointer items-center rounded-lg px-2 py-1.5 text-sm whitespace-nowrap text-sf-text transition-all duration-200 hover:bg-blue-100 hover:text-blue-700"
    :class="{ 'bg-blue-100 text-sf-theme': currentIndex === index }"
    @click="setCurrentIndex(index)"
  >
    <div class="flex flex-1 items-center overflow-hidden">
      <div
        class="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-[6px] text-xs font-bold text-white shadow-xl transition-colors duration-200"
        :style="{
          background: index < style.length ? style[index] : ' var(--color-sf-theme-hover) ',
        }"
      >
        {{ index + 1 }}
      </div>
      <div class="mr-3 flex-1 overflow-hidden text-ellipsis">
        {{ item }}
      </div>
    </div>
    <div class="flex items-center">
      {{ index === currentIndex ? '回车搜索' : '123123213' }}
      <div @click="addTag(index)">加入便签</div>
    </div>
  </div>
</template>

<style scoped></style>
