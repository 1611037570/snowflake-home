<template>
  <Teleport to="body">
    <!-- 背景模糊层 -->
    <Transition name="mask" :disabled="performanceMode">
      <div
        v-if="modeValue"
        class="fixed top-0 right-0 bottom-0 left-0 z-80 bg-sf-transparent-4"
        :style="backgroundStyle"
      ></div>
    </Transition>

    <!-- 弹窗内容 -->
    <Transition name="fade" :disabled="performanceMode">
      <div
        v-if="modeValue"
        ref="mask"
        class="modal-container fixed top-0 right-0 bottom-0 left-0 z-80 flex items-center justify-center"
        @mousemove="handleMouseMove"
      >
        <div
          id="element"
          ref="elementRef"
          class="shadow-4xl flex flex-col rounded-3xl border border-sf-border bg-sf-bg p-3"
          :style="elementStyle"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <!-- 标题和关闭按钮 -->
          <div class="relative flex items-center justify-between">
            <div
              class="mb-3 w-full text-center text-2xl font-bold"
              v-if="title"
              :class="titleClass"
            >
              {{ title }}
            </div>
            <div
              class="group flex-c absolute top-0 right-0 z-2 h-9 w-9 cursor-pointer rounded-xl duration-300 hover:bg-sf-bg-hover"
              @click="modeValue = false"
            >
              <SfIcon icon="carbon:close-outline" size="6" class="group-hover:text-sf-theme" />
            </div>
          </div>
          <!-- 内容区域 -->
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
<script setup>
import { useSystemStore } from '@/stores/modules/system'
import { onKeyStroke } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed, ref, useTemplateRef } from 'vue'

defineOptions({ name: 'SfModal' })

// ==================== Props 定义 ====================
defineProps({
  /** 弹窗标题 */
  title: { type: String, default: '' },
  /** 弹窗标题自定义类名 */
  titleClass: { type: String, default: '' },
})

// ==================== 全局状态 ====================
const systemStore = useSystemStore()
/** 性能模式：开启后禁用所有动效（毛玻璃、3D倾斜、过渡动画） */
const { performanceMode } = storeToRefs(systemStore)

// ==================== 弹窗显隐控制 ====================
const mask = useTemplateRef('mask')
/** 双向绑定弹窗显隐状态 */
const modeValue = defineModel()

// ==================== 键盘事件 ====================
/** 按下 ESC 键关闭弹窗 */
onKeyStroke('Escape', () => {
  if (modeValue.value) modeValue.value = false
})

// ==================== 3D 视差倾斜核心逻辑 ====================
/** 鼠标偏移灵敏度系数（数值越小，倾斜越敏感） */
const multiple = 55
/** 3D 元素 DOM 引用 */
const elementRef = ref(null)
/** 鼠标是否悬浮在卡片上（悬浮时停止倾斜，避免干扰点击） */
const isMouseOverCard = ref(false)

/** X 轴旋转角度（上下倾斜） */
const rx = ref(0)
/** Y 轴旋转角度（左右倾斜） */
const ry = ref(0)

// ---------- 背景模糊样式 ----------
/**
 * 背景遮罩样式
 * - 性能模式：移除毛玻璃模糊，减少 GPU 开销
 * - 正常模式：保留 10px 毛玻璃效果
 */
const backgroundStyle = computed(() => {
  if (performanceMode.value) {
    return {
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
      backgroundColor: 'var(--sf-transparent)',
    }
  }
  return { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }
})

// ---------- 弹窗 3D 倾斜样式 ----------
/**
 * 弹窗主体样式
 * - 性能模式：禁用 transform 和 transition，取消 3D 倾斜
 * - 正常模式：根据鼠标位置动态计算旋转角度，并带有平滑过渡
 */
const elementStyle = computed(() => {
  if (performanceMode.value) {
    return { transform: 'none', transition: 'none' }
  }
  return {
    transform: `translateZ(0) rotateX(${rx.value}deg) rotateY(${ry.value}deg)`,
    transition: 'transform 0.15s ease-out',
  }
})

// ---------- 倾斜计算函数 ----------
/**
 * 根据鼠标坐标计算 3D 旋转角度
 * @param {number} clientX - 鼠标在视口中的 X 坐标
 * @param {number} clientY - 鼠标在视口中的 Y 坐标
 *
 * 原理：以弹窗容器中心为原点，鼠标偏移量除以灵敏度系数得出角度，
 * 并限制最大倾斜角度为 ±14 度，避免过度扭曲。
 */
function transformElement(clientX, clientY) {
  // 鼠标悬停在卡片上时停止倾斜，避免干扰点击操作
  if (isMouseOverCard.value) return
  const element = elementRef.value
  if (!element) return

  // 获取遮罩层（即弹窗容器）的边界，作为旋转参考中心
  const rect = mask.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  // 计算偏移量并转换为角度
  const calcX = -(clientY - centerY) / multiple
  const calcY = (clientX - centerX) / multiple
  const maxAngle = 14 // 最大倾斜角度限制
  rx.value = Math.max(-maxAngle, Math.min(maxAngle, calcX))
  ry.value = Math.max(-maxAngle, Math.min(maxAngle, calcY))
}

// ---------- 鼠标事件处理 ----------
/**
 * 鼠标在遮罩层上移动时触发倾斜效果
 * 使用 requestAnimationFrame 节流，避免高频触发导致性能问题
 */
function handleMouseMove(e) {
  if (performanceMode.value) return
  requestAnimationFrame(() => {
    transformElement(e.clientX, e.clientY)
  })
}

/** 鼠标进入弹窗卡片：暂停倾斜并复位角度 */
function handleMouseEnter() {
  if (performanceMode.value) return
  isMouseOverCard.value = true
  rx.value = 0
  ry.value = 0
}

/** 鼠标离开弹窗卡片：恢复倾斜跟踪 */
function handleMouseLeave() {
  isMouseOverCard.value = false
}
</script>

<style>
.modal-container {
  perspective: 1300px;
  will-change: transform, opacity;
}

#element {
  /* transition 已移至内联样式，由性能模式控制 */
  will-change: transform;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.3);
}

.mask-enter-active,
.mask-leave-active {
  transition:
    opacity 0.1s ease,
    transform 0.1s ease;
}
.mask-enter-from,
.mask-leave-to {
  opacity: 0;
}
</style>
