<template>
  <div class="relative h-full w-full overflow-hidden">
    <div
      ref="pageContainer"
      class="absolute h-full w-full"
      :style="{
        transform: `translateX(-${pagePosition}px)`,
      }"
      :class="[isDrag ? '' : 'duration-100']"
      v-move-start="moveStart"
      v-move="move"
      v-move-end="moveEnd"
    >
      <div
        v-for="(item, index) in list"
        class="absolute h-full w-full overflow-hidden"
        :key="index"
        :style="{ transform: `translate(${index * 100}%,0)` }"
      >
        <el-scrollbar>
          <slot :name="item.value"> {{ item.name }}</slot>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useWindowSize } from '@vueuse/core'
import { vMoveStart, vMove, vMoveEnd } from '@/hooks/useMove'
const { width } = useWindowSize()

import { ref } from 'vue'
const list: any = defineModel('list', { default: [] })

const pageContainer = ref()

const init = () => {
  const { width } = pageContainer.value.getBoundingClientRect()
  pageWidth.value = width
}

watch(() => width.value, init)
onMounted(() => {
  init()
})
// 页面下标
const index = defineModel('index', { default: 0 })
// 单个页面宽度
const pageWidth = ref(0)
// 是否正在拖拽
const isDrag = ref(false)
// 触摸开始时的横坐标
const initialX = ref(0)

// 当前页面的横坐标
const currentX = ref(0)
const pagePosition = computed(() => {
  if (!isDrag.value) {
    return pageWidth.value * index.value
  }
  return currentX.value
})

// 开始移动
const moveStart = (event: any, position: any) => {
  isDrag.value = true
  initialX.value = position.clientX
  currentX.value = pageWidth.value * index.value
}
const move = (event: any, position: any) => {
  // 未拖拽时 不做处理
  if (!isDrag.value) {
    return
  }
  // 计算移动距离
  const moveX = initialX.value - position.clientX

  // 计算当前位置
  let offsetX = moveX + pageWidth.value * index.value

  const maxX = pageWidth.value * (list.value.length - 1)
  // 第一个页面 不能向右滑动
  if (offsetX < 0) {
    offsetX = 0
  }
  // 最后一个页面 不能向左滑动
  else if (offsetX > maxX) {
    offsetX = maxX
  }
  if (offsetX > 0 && offsetX < pageWidth.value * 2) {
    emit('update:offsetX', moveX / (pageWidth.value * 3))
  }
  // 更新当前位置
  currentX.value = offsetX
}
const emit = defineEmits(['update:index', 'update:offsetX'])
const moveEnd = (event: any, position: any) => {
  // 关闭拖拽
  isDrag.value = false
  emit('update:offsetX', 0)
  // 当前页面的60%距离 为一个阈值
  const threshold = pageWidth.value * 0.55
  // 计算移动距离
  const moveX = position.clientX - initialX.value

  // 移动距离小于阈值 不做处理
  if (Math.abs(moveX) < threshold) {
    return
  }
  const currentIndex = Math.round(Math.abs(currentX.value) / pageWidth.value)
  emit('update:index', currentIndex)
}
</script>

<style></style>
