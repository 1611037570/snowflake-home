<template>
  <Teleport to="body" v-if="modeValue">
    <div
      class="body fixed top-0 right-0 bottom-0 left-0 z-80 flex transform items-center justify-center bg-sf-transparent-4"
      ref="mask"
      style="backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px)"
      @mousemove="handleMouseMove"
    >
      <div
        id="element"
        ref="elementRef"
        class="shadow-4xl z-80 flex flex-col rounded-3xl border-1 border-sf-border-base bg-sf-bg p-3"
        :style="transformStyle"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <!-- 标题和关闭按钮 -->
        <div class="relative mb-3 flex items-center justify-between">
          <div class="w-full text-center text-2xl font-bold">{{ title }}</div>
          <div
            class="group flex-c absolute top-1 right-1 z-2 h-9 w-9 transform cursor-pointer rounded-xl duration-300 hover:bg-sf-bg-hover"
            @click="modeValue = false"
          >
            <SfIcon icon="carbon:close-outline" size="6" class="group-hover:text-sf-theme" />
          </div>
        </div>
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { onKeyStroke } from '@vueuse/core'
defineProps({
  title: {
    type: String,
    default: '',
  },
})

const mask = useTemplateRef('mask')
const modeValue = defineModel()
// 监听esc键关闭弹窗
onKeyStroke('Escape', () => {
  if (modeValue.value) {
    modeValue.value = false
  }
})

const { x, y, width, height } = useElementBounding(mask)
const multiple = 55
const elementRef = ref(null)
const isMouseOverCard = ref(false)

const rx = ref(0)
const ry = ref(0)
const transformStyle = computed(() => {
  //  perspective(1200px)
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

onMounted(() => {})
</script>

<style>
.body {
  perspective: 1300px;
}

#element {
  transition: transform 0.3s;
}
</style>
