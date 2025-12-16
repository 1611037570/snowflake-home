<template>
  <!-- 遍历显示所有可见的弹幕 -->
  <div
    class="absolute left-0 bg-amber-300 transition-all duration-8000 ease-linear"
    :style="{
      transform: `translateX(${move})`,
    }"
  >
    123213123123
  </div>
  <div
    v-for="item in visibleDanmaku"
    :key="item.instanceId"
    class="danmaku-item"
    :ref="(el) => setDanmakuRef(item.instanceId, el)"
    :style="getDanmakuStyle(item)"
    @mouseenter="handleMouseEnter(item)"
    @mouseleave="handleMouseLeave(item)"
  >
    {{ item.text }}
  </div>
</template>

<script setup>
// 导入依赖
import { useElementSize } from '@vueuse/core' // 用于监听元素尺寸变化
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

// ========== 默认弹幕数据 ==========
const defaultBulletList = [
  { id: 1, text: '宿命天成命中败 仙尊悔而我不悔' },
  { id: 2, text: '主播太厉害了吧！' },
  { id: 3, text: '666666' },
  { id: 4, text: '千磨万击心铸铁，殚精竭虑铸一剑' },
  { id: 5, text: '一路寒风身如絮 命海沉浮客独行' },
  { id: 6, text: '打卡签到～' },
  { id: 7, text: '求个关注，谢谢啦！' },
  { id: 8, text: '今天的内容超赞！' },
  { id: 9, text: '下次什么时候开播？' },
  { id: 10, text: '支持主播，加油！' },
]
const move = ref('-100%')
setTimeout(() => {
  move.value = `calc(100% + ${containerWidth.value}px)`
}, 1000)
// ========== 组件Props定义 ==========
const props = defineProps({
  // 外部传入的弹幕列表，默认为空数组
  danmakuList: {
    type: Array,
    default: () => [],
  },
  // 弹幕移动的持续时间（秒）
  duration: { type: Number, default: 10 },
  // 每条弹幕的高度（像素）
  itemHeight: { type: Number, default: 30 },
  // 弹幕之间的垂直间距（像素）
  spacing: { type: Number, default: 10 },
  // 顶部边距，用于避开顶部操作栏
  topMargin: { type: Number, default: 0 },
  // 是否允许弹幕在垂直方向上重叠
  overlap: { type: Boolean, default: false },
  // 弹幕循环出现的延迟时间，可以是固定值或[min, max]范围
  loopDelay: { type: [Number, Array], default: () => [800, 2000] },
  // 容器元素的选择器，弹幕会在这个容器内移动
  containerSelector: { type: String, default: '[data-damu-container]' },
})
// function move() {
//   const width = containerWidth.value * 120
// }
// ========== 响应式数据 ==========
const visibleDanmaku = ref([]) // 当前屏幕上可见的弹幕列表
const timers = new Set() // 存储所有setTimeout的ID，便于统一清理
const containerElement = ref(null) // 容器元素的引用
const trackStates = ref(new Map()) // 轨道状态管理，记录每个轨道被占用到何时
const danmakuRefs = new Map() // 存储弹幕DOM元素的引用

// ========== 计算属性 ==========
// 计算实际使用的弹幕列表：优先使用外部传入的，否则使用默认的
const effectiveDanmakuList = computed(() =>
  props.danmakuList.length > 0 ? props.danmakuList : defaultBulletList,
)

// 计算最大轨道数：容器高度 - 顶部边距，除以（弹幕高度 + 间距）
const maxTracks = computed(() => {
  if (!containerElement.value || props.itemHeight <= 0) return 0
  const height = containerElement.value.clientHeight - props.topMargin
  return Math.max(1, Math.floor(height / (props.itemHeight + props.spacing)))
})

// 使用useElementSize监听容器尺寸变化
const { width: containerWidth, height: containerHeight } = useElementSize(containerElement)

// ========== 工具函数 ==========
/**
 * 获取循环延迟时间
 * 如果loopDelay是数组[min, max]，返回这个范围内的随机值
 * 如果是数字，直接返回该数字
 */
const getLoopDelay = () => {
  if (Array.isArray(props.loopDelay)) {
    const [min, max] = props.loopDelay
    return Math.random() * (max - min) + min
  }
  return props.loopDelay
}

/**
 * 获取可用的轨道索引
 * 如果允许重叠，随机返回一个轨道
 * 如果不允许重叠，返回第一个空闲轨道，如果没有则返回最早释放的轨道
 */
const getAvailableTrack = () => {
  // 允许重叠时，随机选择一个轨道
  if (props.overlap) return Math.floor(Math.random() * maxTracks.value)

  const now = Date.now()
  const availableTracks = []

  // 遍历所有轨道，找出当前空闲的轨道
  for (let i = 0; i < maxTracks.value; i++) {
    const occupiedUntil = trackStates.value.get(i)
    // 轨道没有被占用或占用已过期
    if (!occupiedUntil || occupiedUntil < now) availableTracks.push(i)
  }

  // 如果有空闲轨道，随机选择一个
  if (availableTracks.length > 0)
    return availableTracks[Math.floor(Math.random() * availableTracks.length)]

  // 如果没有空闲轨道，找出最早释放的轨道
  let earliestTime = Infinity
  let bestTrack = 0

  trackStates.value.forEach((occupiedUntil, track) => {
    if (occupiedUntil < earliestTime) {
      earliestTime = occupiedUntil
      bestTrack = track
    }
  })

  return bestTrack
}

/**
 * 计算弹幕的top位置
 * 基础位置 = 顶部边距 + 轨道索引 * (弹幕高度 + 间距)
 * 如果允许重叠，在轨道内随机偏移
 */
const calculateTopPosition = (trackIndex) => {
  const base = props.topMargin + trackIndex * (props.itemHeight + props.spacing)
  return props.overlap ? base + Math.random() * props.spacing : base
}

/**
 * 占用轨道
 * 记录该轨道被占用到何时（当前时间 + 弹幕持续时间）
 * 仅当不允许重叠时才需要占用轨道
 */
const occupyTrack = (trackIndex) => {
  if (!props.overlap) trackStates.value.set(trackIndex, Date.now() + props.duration * 1000)
}

/**
 * 释放轨道
 * 仅当不允许重叠时才需要释放轨道
 */
const releaseTrack = (trackIndex) => {
  if (!props.overlap) trackStates.value.delete(trackIndex)
}

// ========== 弹幕管理 ==========
/**
 * 创建弹幕对象
 * 包含弹幕的所有状态信息
 */
const createDanmaku = (data) => {
  const trackIndex = getAvailableTrack()
  if (trackIndex === undefined) return null // 没有可用轨道时返回null

  return {
    ...data, // 原始弹幕数据（id, text等）
    instanceId: `${data.id}-${Date.now()}`, // 唯一实例ID
    trackIndex, // 分配的轨道索引
    top: calculateTopPosition(trackIndex), // 垂直位置
    translateX: 0, // 当前水平位移（未使用，保留字段）
    isPaused: false, // 是否暂停状态
    animationId: null, // requestAnimationFrame的ID
    animationStartTime: null, // 动画开始时间
    currentTranslateX: 0, // 当前的水平位移值
  }
}

/**
 * 设置弹幕DOM元素引用
 * 便于通过instanceId快速找到对应的DOM元素
 */
const setDanmakuRef = (instanceId, el) => {
  if (el) {
    danmakuRefs.set(instanceId, el)
  } else {
    danmakuRefs.delete(instanceId)
  }
}

// ========== 动画控制 ==========
/**
 * 开始弹幕动画
 * 使用requestAnimationFrame实现平滑的从左到右移动
 */
const animateDanmaku = (item) => {
  if (!containerElement.value || item.isPaused) return

  const element = danmakuRefs.get(item.instanceId)
  if (!element) return

  // 计算动画参数
  const startX = -element.offsetWidth // 起始位置：弹幕完全在容器左侧外
  const endX = containerElement.value.clientWidth // 结束位置：弹幕完全移出容器右侧
  const totalDistance = endX - startX // 总移动距离
  const speed = totalDistance / (props.duration * 1000) // 移动速度（像素/毫秒）

  let lastTime = performance.now() // 上一次动画帧的时间

  // 动画循环函数
  const animate = (currentTime) => {
    // 安全检查：如果弹幕已被移除，停止动画
    if (!visibleDanmaku.value.find((d) => d.instanceId === item.instanceId) || !element) {
      cancelAnimationFrame(item.animationId)
      return
    }

    // 如果弹幕被暂停，不更新位置，但继续保持动画循环
    if (item.isPaused) {
      item.animationStartTime = currentTime
      item.animationId = requestAnimationFrame(animate)
      return
    }

    // 计算时间差并更新位置
    const deltaTime = currentTime - lastTime
    lastTime = currentTime

    item.currentTranslateX += speed * deltaTime
    element.style.transform = `translateX(${item.currentTranslateX}px)`

    // 检查是否到达终点
    if (item.currentTranslateX >= endX) {
      cancelAnimationFrame(item.animationId)
      handleAnimationEnd(item)
      return
    }

    // 继续下一帧
    item.animationId = requestAnimationFrame(animate)
  }

  // 设置初始位置并启动动画
  item.currentTranslateX = startX
  element.style.transform = `translateX(${startX}px)`

  item.animationStartTime = performance.now()
  item.animationId = requestAnimationFrame(animate)
}

/**
 * 鼠标移入处理：暂停弹幕移动并改变样式
 */
const handleMouseEnter = (item) => {
  if (!item.isPaused) {
    item.isPaused = true // 标记为暂停状态
    const element = danmakuRefs.get(item.instanceId)
    if (element) {
      // 改变背景色和添加缩放效果
      element.style.backgroundColor = 'rgba(255, 0, 0, 0.6)'
      element.style.transform = `translateX(${item.currentTranslateX}px) scale(1.05)`
    }
  }
}

/**
 * 鼠标移出处理：恢复弹幕移动并恢复样式
 */
const handleMouseLeave = (item) => {
  if (item.isPaused) {
    item.isPaused = false // 标记为非暂停状态
    const element = danmakuRefs.get(item.instanceId)
    if (element) {
      // 恢复原始样式
      element.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
      element.style.transform = `translateX(${item.currentTranslateX}px) scale(1)`
    }
  }
}

/**
 * 动画结束处理：清理当前弹幕，准备重新添加
 */
const handleAnimationEnd = (item) => {
  // 释放轨道
  releaseTrack(item.trackIndex)

  // 从可见列表中移除
  const index = visibleDanmaku.value.findIndex((d) => d.instanceId === item.instanceId)
  if (index !== -1) visibleDanmaku.value.splice(index, 1)

  // 清理DOM引用
  danmakuRefs.delete(item.instanceId)

  // 重新添加弹幕（实现循环）
  const sourceData = effectiveDanmakuList.value.find((d) => d.id === item.id)
  if (sourceData) {
    const timer = setTimeout(() => addDanmaku(sourceData), getLoopDelay())
    timers.add(timer)
  }
}

/**
 * 添加新弹幕到屏幕上
 */
const addDanmaku = (data) => {
  // 如果容器尺寸还未确定或没有轨道，延迟重试
  if (maxTracks.value === 0 || !containerElement.value) {
    const timer = setTimeout(() => addDanmaku(data), 100)
    timers.add(timer)
    return
  }

  // 创建弹幕对象
  const danmaku = createDanmaku(data)
  if (!danmaku) {
    // 没有可用轨道，延迟重试
    const timer = setTimeout(() => addDanmaku(data), 100)
    timers.add(timer)
    return
  }

  // 占用轨道并添加到可见列表
  occupyTrack(danmaku.trackIndex)
  visibleDanmaku.value.push(danmaku)

  // 等待DOM渲染后开始动画
  nextTick(() => {
    animateDanmaku(danmaku)
  })
}

// ========== 样式计算 ==========
/**
 * 计算弹幕的样式对象
 */
const getDanmakuStyle = (item) => ({
  top: `${item.top}px`, // 垂直位置
  height: `${props.itemHeight}px`, // 高度
  lineHeight: `${props.itemHeight}px`, // 行高（垂直居中）
  position: 'absolute', // 绝对定位
  left: '0', // 水平起始位置
  whiteSpace: 'nowrap', // 不换行
  color: 'white', // 文字颜色
  textShadow: '1px 1px 2px black', // 文字阴影
  fontSize: '14px', // 字体大小
  pointerEvents: 'auto', // 允许鼠标事件
  padding: '0 8px', // 内边距
  borderRadius: '15px', // 圆角
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明黑色背景
  backdropFilter: 'blur(2px)', // 背景模糊
  userSelect: 'none', // 禁止文字选择
  willChange: 'transform', // 提示浏览器优化transform变化
  transition: 'transform 0.2s ease, background-color 0.2s ease', // 过渡动画
  transform: `translateX(${item.currentTranslateX}px)`, // 水平位移
})

// ========== 初始化与清理 ==========
/**
 * 初始化弹幕：清空所有状态，重新开始
 */
const initDanmaku = () => {
  // 清理所有定时器
  clearAllTimers()

  // 停止所有动画
  visibleDanmaku.value.forEach((item) => {
    if (item.animationId) cancelAnimationFrame(item.animationId)
  })

  // 清空所有状态
  visibleDanmaku.value = []
  trackStates.value.clear()
  danmakuRefs.clear()

  // 重新添加所有弹幕，加入随机延迟避免同时出现
  effectiveDanmakuList.value.forEach((item, index) => {
    const timer = setTimeout(() => addDanmaku(item), Math.random() * 1000 + index * 300)
    timers.add(timer)
  })
}

/**
 * 清理所有定时器
 */
const clearAllTimers = () => {
  timers.forEach((timer) => clearTimeout(timer))
  timers.clear()
}

// ========== 监听器 ==========
// 监听弹幕列表变化：重新初始化
watch(() => props.danmakuList, initDanmaku, { deep: true })

// 监听容器高度变化：重新初始化（影响轨道数）
watch(containerHeight, initDanmaku)

// 监听容器宽度变化：如果宽度变化且有弹幕，重新初始化
watch(containerWidth, () => {
  if (containerWidth.value > 0 && visibleDanmaku.value.length > 0) initDanmaku()
})

// ========== 生命周期 ==========
onMounted(() => {
  // 查找容器元素，如果没有找到则使用document.documentElement
  containerElement.value =
    document.querySelector(props.containerSelector) || document.documentElement
  console.log('containerElement', containerElement)

  // 等待下一帧后初始化弹幕
  nextTick(initDanmaku)
})

onUnmounted(() => {
  // 组件卸载时清理所有资源
  clearAllTimers()
  visibleDanmaku.value.forEach((item) => {
    if (item.animationId) cancelAnimationFrame(item.animationId)
  })
})

// ========== 暴露给父组件的方法 ==========
defineExpose({
  // 动态添加新弹幕
  addDanmaku: (text) => {
    const id = Date.now() // 使用时间戳作为唯一ID
    const danmaku = { id, text }
    addDanmaku(danmaku)
    return id
  },
  // 清空所有弹幕
  clearAll: initDanmaku,
})
</script>

<style scoped>
.danmaku-item {
  cursor: default; /* 默认光标 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); /* 阴影效果 */
}

.danmaku-item:hover {
  z-index: 10000 !important; /* 悬停时置于最顶层 */
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.5); /* 悬停时的红色阴影 */
}
</style>
