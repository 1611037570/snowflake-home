<template>
  <div class="relative overflow-hidden rounded-4xl bg-sf-modal p-1">
    <!-- Tab列表容器 -->
    <div class="relative z-10 flex" @mouseleave="handleMouseLeave">
      <!-- 循环渲染Tab项 -->
      <div
        v-for="(item, index) in list"
        :key="index"
        class="tab-item relative z-10 flex-1 cursor-pointer rounded-4xl px-2 py-1 text-center transition-all duration-100"
        :class="[isActive(index) ? 'font-medium text-sf-primary' : 'text-sf-text']"
        @mouseenter="handleMouseEnter(index)"
        @click="handleClick(index)"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
      >
        {{ item.name }}
      </div>
      <!-- 背景指示器，实现跟随动画效果 -->
      <div
        class="absolute top-0 h-full rounded-4xl bg-sf-theme"
        style="transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        :class="{
          'scale-110': isMouseDown,
        }"
        :style="{
          width: `${100 / list.length}%`,
          left: `${currentBackgroundIndex * (100 / list.length)}%`,
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// 定义组件接收的props
const { list } = defineProps<{
  // Tab列表数据
  list: string[]
  // 默认选中的下标
  activeIndex?: number
}>()
const modelValue = defineModel('modelValue')

// 鼠标悬停的下标
const hoverIndex = ref<number | null>(null)

// 当前激活的下标（使用响应式引用而不是计算属性引用自身）
const currentActiveIndex = ref(0)

onMounted(() => {
  currentActiveIndex.value = list.findIndex((item) => item.value === modelValue.value)
})
// 处理鼠标进入事件
const handleMouseEnter = (index: number) => {
  hoverIndex.value = index
}

// 处理鼠标离开事件
const handleMouseLeave = () => {
  hoverIndex.value = null
}

// 处理点击事件
const handleClick = (index: number) => {
  currentActiveIndex.value = index
  modelValue.value = list[index].value
}
const isMouseDown = ref(false)
const handleMouseDown = () => {
  isMouseDown.value = true
}

// 处理鼠标松开事件
const handleMouseUp = () => {
  setTimeout(() => {
    isMouseDown.value = false
  }, 50)
}
// 判断是否激活
const isActive = (index: number) => {
  return hoverIndex.value !== null ? index === hoverIndex.value : index === currentActiveIndex.value
}

// 计算当前背景指示器应该显示的下标
const currentBackgroundIndex = computed(() => {
  return hoverIndex.value ?? currentActiveIndex.value
})
</script>

<style scoped></style>
