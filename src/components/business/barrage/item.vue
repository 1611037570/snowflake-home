<template>
  <div
    class="flex-c absolute left-0 h-10 cursor-pointer rounded-xl bg-sf-bg px-3 py-1.5 text-base text-black"
    ref="barrageRef"
    @mouseenter="handleMouseEnter(item)"
    @mouseleave="handleMouseLeave(item)"
    @click="handleCopy(item.text)"
    :style="[item.style]"
  >
    {{ item.text }}
  </div>
</template>

<script setup>
import { getRandomColor } from '@/utils/modules/getRandomColor'
import { useClipboard, useElementBounding, useIntersectionObserver } from '@vueuse/core'
import { onMounted, onUnmounted, ref } from 'vue'

const barrageRef = ref()
const item = defineModel('item')
const props = defineProps({
  containerWidth: {
    type: Number,
    default: 0,
  },
  containerRef: {
    type: Object,
    default: () => null,
  },
})

// 仅新增：定义固定速度（核心修复，非无关代码）
const BARRAGE_SPEED = 0.2

const { copy } = useClipboard()
function handleCopy(text) {
  copy(text)
    .then(() => {
      ElMessage.success('复制成功')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}
function handleMouseEnter(data) {
  const { left, width } = useElementBounding(barrageRef)
  data.style.transition = 'none'
  data.style.transform = `translateX(${left.value}px)`
  data.left = left.value
  data.width = width.value
}

function handleMouseLeave(data) {
  const endX = props.containerWidth + data.width
  const remainingDistance = endX - data.left
  // 修复：替换原有时长计算逻辑，改为按固定速度计算
  const remainingDuration = remainingDistance / BARRAGE_SPEED
  data.style.transition = `transform ${remainingDuration}ms linear`
  data.style.transform = `translateX(${endX + data.width}px)`
}

let stopObserve = null
const emit = defineEmits(['leave', 'enter'])
const isEntered = ref(false)
onMounted(() => {
  setTimeout(() => {
    const { width } = useElementBounding(barrageRef)
    // 修复：初始动画时长改为按固定速度计算
    const totalDistance = props.containerWidth + width.value
    const totalDuration = totalDistance / BARRAGE_SPEED
    item.value.style.transform = `translateX(${props.containerWidth + width.value}px)`
    // 修复：初始过渡时长使用计算后的值
    item.value.style.transition = `transform ${totalDuration}ms linear`
    item.value.style.background = getRandomColor()

    if (!props.containerRef) {
      console.log('观察器初始化失败: 缺少必要的DOM元素')
      return
    }
    const observerResult = useIntersectionObserver(
      barrageRef,
      ([entry]) => {
        if (isEntered.value && entry.intersectionRatio === 0) {
          console.log('弹幕完全离开容器（移动后触发）')
          stopObserve()
          emit('leave', item.value)
        }
        if (entry.intersectionRatio === 1) {
          console.log('弹幕完全进入容器（交集比例1）')
          isEntered.value = true
          emit('enter', item.value)
        }
      },
      {
        root: props.containerRef,
        threshold: [0, 0.2, 0.5, 0.7, 1],
        trackVisibility: true,
        delay: 0,
      },
    )
    stopObserve = observerResult.stop
  }, 1000)
})

onUnmounted(() => {
  if (stopObserve) {
    stopObserve()
  }
})
</script>

<style scoped></style>
