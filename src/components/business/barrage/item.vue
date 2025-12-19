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
import {
  useClipboard,
  useDebounceFn,
  useElementBounding,
  useIntersectionObserver,
} from '@vueuse/core'
import { onMounted, onUnmounted, ref, watch } from 'vue'

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
  const remainingDuration = (remainingDistance / endX) * 8000
  data.style.transition = `transform ${remainingDuration}ms linear`
  data.style.transform = `translateX(${endX + data.width}px)`
}

const debounceHandleResize = useDebounceFn(() => {
  handleMouseEnter(item.value)
  handleMouseLeave(item.value)
}, 200)
watch(() => props.containerWidth, debounceHandleResize)

// 组件挂载后再初始化观察器
let stopObserve = null
const emit = defineEmits(['leave', 'enter'])
const isEntered = ref(false)
onMounted(() => {
  setTimeout(() => {
    item.value.style.transform = `translateX(calc(100% + ${props.containerWidth}px))`
    item.value.style.background = getRandomColor()

    // 确保barrageRef和containerRef都已准备好
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
        // 标记：元素进入容器（交集比例>0）
        if (entry.intersectionRatio === 1) {
          console.log('弹幕完全进入容器（交集比例1）')
          isEntered.value = true
          emit('enter', item.value)
        }
      },
      {
        root: props.containerRef,
        // 新增：监听0和1两个阈值，覆盖“完全进入→完全离开”全流程
        threshold: [0, 0.2, 0.5, 0.7, 1],
        // 强制开启可见性追踪，确保transform变化能被检测
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
