<template>
  <SfViewContainer title="留言板">
    <template #right>
      <!-- 生成按钮 -->
      <button
        class="add-cards-btn bg-opacity-95 transform cursor-pointer rounded-full border border-gray-200 bg-white px-2 py-1 text-lg font-semibold text-gray-800 shadow-lg transition-all duration-200 outline-none hover:scale-105 hover:bg-white hover:shadow-xl active:scale-95"
        @click="generateCards"
        :disabled="isGenerating"
      >
        {{ isGenerating ? `生成中...` : `重新获取` }}
      </button>
    </template>
    <!-- 便签墙 - 简化样式配置 -->
    <div
      ref="noteWallContainer"
      class="relative h-full w-full overflow-hidden bg-gray-100 font-sans text-gray-800"
      style="
        background-image:
          linear-gradient(0deg, #eee 3px, transparent 0),
          linear-gradient(90deg, #eee 3px, transparent 0);
        background-size: 100px 100px;
      "
    >
      <!-- 便签卡片渲染 -->
      <Card
        v-for="card in cards"
        v-model:topId="topId"
        :key="card.id"
        :item="card"
        :color="card.color"
        :card-style="getCardStyle(card)"
      />

      <!-- 加载指示器 -->
      <div
        class="bg-opacity-95 fixed top-1/2 left-1/2 z-[1000001] -translate-x-1/2 -translate-y-1/2 transform flex-col items-center gap-4 rounded-2xl bg-white p-5 text-gray-800 shadow-xl backdrop-blur-sm"
        :class="{ hidden: !showLoading, flex: showLoading }"
      >
        <div
          class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#28c840]"
        ></div>
        <span class="text-base">{{ loadingText }}</span>
      </div>
    </div>
  </SfViewContainer>
</template>

<script setup>
// 模块概述：生成便签卡片并进行位置避让与入场过渡，支持批量渲染与加载提示

// 工具方法：随机取列表元素、生成唯一 ID
import { getRandomItem, getUUID } from '@/utils'
// 尺寸观察：实时获取并响应容器宽高变化
import { useElementSize } from '@vueuse/core'

// Vue API：异步刷新、响应式引用、浅响应列表、生命周期
import { nextTick, ref, shallowRef, onMounted } from 'vue'
// 组件与配置：卡片组件与布局/交互相关常量
import Card from './card.vue'
import { BATCH_SIZE, CARD_HEIGHT, CARD_WIDTH, MAX_ROTATE_ANGLE, TOTAL_CARDS } from './config'
// 数据池：颜色集合、固定文案、随机文案
import { colors, fixedList, list } from './data'

// 帧等待：等待浏览器下一帧，确保 DOM 已绘制，便于后续过渡生效
const waitForNextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve))

// 页面状态：卡片列表与生成流程控制
const cards = shallowRef([]) // 卡片集合（浅响应，提升列表操作性能）
const isGenerating = ref(false) // 是否处于生成流程中
const showLoading = ref(false) // 是否显示加载指示器
const loadingText = ref(`生成中... 0/${TOTAL_CARDS}`) // 加载提示文案
const topId = ref('') // 置顶卡片 ID（由子组件双向绑定维护）
const noteWallContainer = ref(null) // 便签墙容器引用
const { width, height } = useElementSize(noteWallContainer) // 容器宽高（响应式 Ref）

// 内容索引：先固定文案，后随机文案；耗尽后走随机池
let contentIdx = 0 // 当前消费索引

// 视口有效区域：计算卡片可布局范围与中心点
const getViewportValidArea = () => {
  const w = width.value
  const h = height.value
  return {
    maxLeft: w - CARD_WIDTH, // 最大左偏移（确保不越界）
    maxTop: h - CARD_HEIGHT, // 最大上偏移（确保不越界）
    centerX: w / 2 - CARD_WIDTH / 2, // 容器中心 X
    centerY: h / 2 - CARD_HEIGHT / 2, // 容器中心 Y
  }
}

// 随机位置：生成目标位置（限制在有效范围内）
const generateRandomPosition = (maxLeft, maxTop) => ({
  targetLeft: Math.random() * maxLeft,
  targetTop: Math.random() * maxTop,
})

// 安全位置：随机取点并避让已存在卡片，直到不碰撞或达到最大重试
const getSafeCardPosition = () => {
  const { maxLeft, maxTop } = getViewportValidArea()
  const pos = generateRandomPosition(maxLeft, maxTop)
  return pos
}

// 基础卡片：初始位于中心点，后续通过过渡移动到目标位置
const createSingleCard = (
  centerX, // 入口中心 X
  centerY, // 入口中心 Y
) => ({
  id: getUUID(), // 唯一标识
  angle: (Math.random() - 0.5) * MAX_ROTATE_ANGLE, // 随机旋转角度
  centerX,
  centerY,
  targetLeft: centerX, // 初始目标与中心一致，便于过渡计算
  targetTop: centerY,
  visible: false, // 初始不可见，插入后再显隐触发过渡
})

// 主流程：分批生成并插入卡片，插入后一帧再显隐以触发过渡
const generateCards = async () => {
  if (isGenerating.value) return // 避免重复触发

  // 初始化批次状态
  isGenerating.value = true
  cards.value = []
  showLoading.value = true
  loadingText.value = `生成中... 0/${TOTAL_CARDS}`
  contentIdx = 0

  const { centerX, centerY } = getViewportValidArea()
  // 分批插入：每批插入后等待一帧再设为可见，触发入场过渡
  for (let startId = 0; startId < TOTAL_CARDS; startId += BATCH_SIZE) {
    const endId = Math.min(startId + BATCH_SIZE, TOTAL_CARDS)
    const currentBatch = createBatchCards(startId, endId, centerX, centerY)

    cards.value = cards.value.concat(currentBatch)
    await nextTick()
    await waitForNextFrame()
    currentBatch.forEach((card) => (card.visible = true))

    loadingText.value = `生成中... ${endId}/${TOTAL_CARDS}`
  }
  loadingText.value = `生成完成！共${TOTAL_CARDS}个便签`
  isGenerating.value = false
  showLoading.value = false
}

// 首次挂载：等待一轮渲染，再延迟以确保容器尺寸已就绪，然后触发生成
onMounted(async () => {
  await nextTick()
  setTimeout(() => generateCards(), 300)
})

// 内容选择：先用固定内容，耗尽后按需从随机池取值
const nextContent = () => {
  if (contentIdx < fixedList.length) {
    return { content: fixedList[contentIdx++], type: 'fixed' }
  }
  const i = contentIdx - fixedList.length
  if (i < list.length) {
    contentIdx++
    return { content: list[i], type: 'random' }
  }
  return { content: getRandomItem(list), type: 'random' }
}

// 批量生成：在当前列表基础上避让，生成一批目标位置与内容
const createBatchCards = (
  startId, // 本批起始下标（包含）
  endId, // 本批结束下标（不包含）
  centerX, // 布局中心 X
  centerY, // 布局中心 Y
) => {
  const batchCards = []

  for (let i = startId; i < endId; i++) {
    const { content, type } = nextContent()

    batchCards.push({
      ...createSingleCard(centerX, centerY),
      ...getSafeCardPosition(),
      content,
      color: getRandomItem(colors),
      type,
    })
  }
  return batchCards
}

// 便签样式：初始缩放/透明，显隐后过渡到目标位置与不透明
const getCardStyle = (
  card, // 当前卡片数据
) => {
  const offsetX = card.targetLeft - card.centerX
  const offsetY = card.targetTop - card.centerY

  return {
    left: `${card.centerX}px`,
    top: `${card.centerY}px`,
    opacity: card.visible ? 1 : 0,
    transform: card.visible
      ? `scale(1) rotate(${card.angle}deg) translate(${offsetX}px, ${offsetY}px)`
      : `scale(0.1) rotate(${card.angle}deg)`,
    transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
  }
}
</script>

<style scoped></style>
