<template>
  <Teleport to="body">
    <!-- 用一个容器包裹背景和内容，并应用过渡 -->
    <Transition name="fade">
      <div
        v-if="modeValue"
        class="modal-container fixed top-0 right-0 bottom-0 left-0 z-80 flex items-center justify-center bg-sf-transparent-4"
        ref="mask"
        style="backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px)"
        @mousemove="handleMouseMove"
      >
        <div
          id="element"
          ref="elementRef"
          class="shadow-4xl flex flex-col rounded-3xl border border-sf-border bg-sf-bg p-3"
          :style="transformStyle"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <!-- 标题和关闭按钮（不变） -->
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
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onKeyStroke, useElementBounding } from '@vueuse/core'
import { computed, ref, useTemplateRef } from 'vue'

defineOptions({ name: 'SfModal' })

defineProps({
  title: { type: String, default: '' },
  titleClass: { type: String, default: '' },
})

const mask = useTemplateRef('mask')
const modeValue = defineModel()

onKeyStroke('Escape', () => {
  if (modeValue.value) modeValue.value = false
})

const { x, y, width, height } = useElementBounding(mask) // 容器全屏，left/top 为 0
const multiple = 55
const elementRef = ref(null)
const isMouseOverCard = ref(false)

const rx = ref(0)
const ry = ref(0)
const transformStyle = computed(() => {
  return `transform:translateZ(0) rotateX(${rx.value}deg) rotateY(${ry.value}deg)`
})

function transformElement(clientX, clientY) {
  if (isMouseOverCard.value) return
  const element = elementRef.value
  if (!element) return
  const calcX = -(clientY - y.value - height.value / 2) / multiple
  const calcY = (clientX - x.value - width.value / 2) / multiple
  const num = 14
  rx.value = Math.max(-num, Math.min(num, calcX))
  ry.value = Math.max(-num, Math.min(num, calcY))
}

function handleMouseMove(e) {
  requestAnimationFrame(() => transformElement(e.clientX, e.clientY))
}
function handleMouseEnter() {
  isMouseOverCard.value = true
  rx.value = 0
  ry.value = 0
}
function handleMouseLeave() {
  isMouseOverCard.value = false
}
</script>

<style>
/* 容器提供透视，内容自身过渡保持旋转平滑 */
.modal-container {
  perspective: 1300px;
}

#element {
  transition: transform 0.3s;
}

/* 整体淡入淡出 + 缩放动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.2);
}
</style>
