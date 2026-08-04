<template>
  <div class="flex flex-col items-center">
    <!-- 结果显示：从下往上滑动过渡 -->
    <div
      v-if="result"
      class="mb-2 text-sm font-medium whitespace-nowrap text-gray-800 transition-all duration-600 ease-out"
      :class="{
        'translate-y-10 scale-90 transform opacity-0': !result,
        'translate-y-0 scale-100 transform opacity-100': result,
      }"
    >
      {{ result }}
    </div>

    <!-- 转盘容器：hover交互提示 -->
    <div
      class="relative h-20 w-20 cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
      @click="startSpin"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
      :class="{ 'cursor-not-allowed opacity-70 hover:scale-100': isSpinning }"
    >
      <!-- 鼠标经过提示 -->
      <div
        v-show="isHovered"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-xs font-bold text-white transition-opacity duration-100"
      >
        吃什么
      </div>
      <!-- 转盘 SVG：扇区hover加亮 -->
      <svg
        class="h-full w-full overflow-hidden rounded-full transition-all duration-300"
        viewBox="0 0 100 100"
      >
        <g
          :transform="`rotate(${rotation}, 50, 50)`"
          class="transition-transform duration-5000 ease-out hover:brightness-110 hover:filter"
          @transitionend="handleSpinEnd"
        >
          <!-- 动态生成扇区 -->
          <path
            v-for="(item, index) in items"
            :key="index"
            :d="getSectorPath(index)"
            :fill="getSectorColor(index)"
          />
        </g>
      </svg>

      <!-- 转盘指针：hover放大 -->
      <div
        class="absolute top-0 left-1/2 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-red-500 shadow-md transition-transform duration-300 hover:scale-125"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// 接收外部传入的奖项数组
const props = defineProps({
  items: {
    type: Array,
    default: () => ['螺蛳粉', '猪脚饭', '麻辣烫', '烧烤', '火锅', '炒饭', '汉堡'],
  },
})

// 状态管理
const rotation = ref(0) // 旋转角度
const isSpinning = ref(false) // 是否正在旋转
const result = ref('') // 旋转结果
const spinEnded = ref(false) // 旋转结束标记
const resultTimer = ref(null) // 结果自动消失定时器
const isHovered = ref(false) // 是否鼠标悬停

// 计算扇区总数和单个扇区角度（固定值，无随机）
const sectorCount = computed(() => props.items.length)
const anglePerSector = computed(() => 360 / sectorCount.value) // 单个扇区的角度

// 生成扇区颜色（循环使用预设色）
const getSectorColor = (index) => {
  const colors = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#84cc16',
    '#10b981',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#ec4899',
  ]
  return colors[index % colors.length]
}

// 计算扇形路径（SVG绘图逻辑，不变）
const getSectorPath = (index) => {
  if (sectorCount.value === 0) return ''

  const startAngle = index * anglePerSector.value // 扇区起始角度
  const endAngle = startAngle + anglePerSector.value // 扇区结束角度

  // 角度转弧度（-90确保从顶部开始绘制）
  const startRad = (startAngle - 90) * (Math.PI / 180)
  const endRad = (endAngle - 90) * (Math.PI / 180)

  // 计算扇区边缘坐标
  const startX = 50 + 50 * Math.cos(startRad)
  const startY = 50 + 50 * Math.sin(startRad)
  const endX = 50 + 50 * Math.cos(endRad)
  const endY = 50 + 50 * Math.sin(endRad)

  // 生成SVG路径
  return [
    `M 50 50`,
    `L ${startX} ${startY}`,
    `A 50 50 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${endX} ${endY}`,
    `Z`,
  ].join(' ')
}

// 开始旋转：100%精准落在扇区中心（核心修改）
const startSpin = () => {
  if (isSpinning.value || sectorCount.value === 0) return

  // 清除旧定时器
  if (resultTimer.value) clearTimeout(resultTimer.value)

  isSpinning.value = true
  result.value = ''
  spinEnded.value = false

  // 1. 随机选中一个目标扇区（保证随机性）
  const targetSectorIndex = Math.floor(Math.random() * sectorCount.value)
  // 2. 计算目标扇区的【正中心角度】（关键：彻底消除偏移）
  const sectorCenterAngle = targetSectorIndex * anglePerSector.value + anglePerSector.value / 2
  // 3. 基础旋转：3-5圈（保证动画流畅，不影响精准度）
  const baseRotation = rotation.value + 360 * (3 + Math.random() * 2)

  // 最终角度 = 基础旋转 + 扇区中心角度（100%精准）
  rotation.value = baseRotation + sectorCenterAngle
}

// 旋转结束处理（逻辑不变，结果必然对应中心扇区）
const handleSpinEnd = () => {
  if (spinEnded.value || !isSpinning.value) return

  spinEnded.value = true
  isSpinning.value = false

  // 计算选中的扇区（因角度精准，结果必然正确）
  const normalizedRotation = ((rotation.value % 360) + 360) % 360
  const adjustedRotation = (360 - normalizedRotation + 90) % 360
  const selectedIndex = Math.floor(adjustedRotation / anglePerSector.value) % sectorCount.value

  // 显示结果并3秒后自动消失
  result.value = props.items[selectedIndex]
  resultTimer.value = setTimeout(() => {
    result.value = ''
  }, 3000)
}
</script>
