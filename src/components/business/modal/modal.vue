<template>
  <Teleport to="body">
    <!-- 背景模糊层 -->
    <Transition name="mask">
      <div
        v-if="modeValue"
        class="fixed top-0 right-0 bottom-0 left-0 z-80 bg-sf-transparent-4"
        style="backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px)"
      ></div>
    </Transition>
    <!-- 弹窗内容 -->
    <Transition name="fade">
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
          :style="transformStyle"
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
import { onKeyStroke } from '@vueuse/core'
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

  // 直接获取实时边界，避免响应式开销
  const rect = mask.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const calcX = -(clientY - centerY) / multiple
  const calcY = (clientX - centerX) / multiple
  const num = 14
  rx.value = Math.max(-num, Math.min(num, calcX))
  ry.value = Math.max(-num, Math.min(num, calcY))
}

function handleMouseMove(e) {
  requestAnimationFrame(() => {
    transformElement(e.clientX, e.clientY)
  })
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
.modal-container {
  perspective: 1300px;
  will-change: transform, opacity;
}

#element {
  transition: transform 0.15s ease-out;
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
