<template>
  <ElCollapse v-model="activeNames">
    <ElCollapseItem name="size-adjust">
      <template #title>
        <div class="flex w-full items-center justify-between pr-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">尺寸调整</span>
            <BaseIcon
              icon="material-symbols:restart-alt"
              size="5"
              class="hover:text-sf-theme"
              @click.stop="resetToOriginal"
            />
          </div>
        </div>
      </template>
      <div class="flex flex-col gap-2">
        <!-- 切换选项卡 -->
        <div class="inline-flex rounded-md bg-sf-primary-hover/60 p-1">
          <button
            class="rounded px-3 py-1 text-xs font-semibold"
            :class="
              inputMode === 'pixel'
                ? 'text-sf-basic bg-sf-primary shadow'
                : 'text-sf-secondary hover:text-sf-basic'
            "
            @click="inputMode = 'pixel'"
          >
            像素
          </button>
          <button
            class="rounded px-3 py-1 text-xs font-semibold"
            :class="
              inputMode === 'percent'
                ? 'text-sf-basic bg-sf-primary shadow'
                : 'text-sf-secondary hover:text-sf-basic'
            "
            @click="inputMode = 'percent'"
          >
            百分比
          </button>
        </div>

        <!-- 像素模式 -->
        <div v-if="inputMode === 'pixel'" class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-sf-secondary w-8 text-sm">宽度</span>
            <ElInputNumber
              v-model="w"
              :min="1"
              :max="originalW"
              class="flex-1"
              placeholder="像素"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sf-secondary w-8 text-sm">高度</span>
            <ElInputNumber
              v-model="h"
              :min="1"
              :max="originalH"
              class="flex-1"
              placeholder="像素"
            />
          </div>
        </div>

        <!-- 百分比模式 -->
        <div v-else class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-sf-secondary w-8 text-sm">宽度</span>
            <ElInputNumber v-model="percentW" :min="1" :max="100" class="flex-1" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sf-secondary w-8 text-sm">高度</span>
            <ElInputNumber v-model="percentH" :min="1" :max="100" class="flex-1" placeholder="%" />
          </div>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-xs">等比缩放</span>
          <ElSwitch v-model="keepAspectRatio" />
        </div>
      </div>
    </ElCollapseItem>
  </ElCollapse>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  initialW: { type: Number, default: 0 },
  initialH: { type: Number, default: 0 },
})

const modelValue = defineModel('modelValue')

const keepAspectRatio = ref(true)
const w = ref(props.initialW || 0)
const h = ref(props.initialH || 0)
const originalW = ref(props.initialW || 0)
const originalH = ref(props.initialH || 0)
const inputMode = ref('pixel') // 'pixel' 或 'percent'
const percentW = ref(100) // 宽度百分比
const percentH = ref(100) // 高度百分比
const activeNames = ref(['size-adjust'])

// 是否有原始尺寸
const hasOriginalSize = computed(() => originalW.value > 0 && originalH.value > 0)

// 计算宽高比
const aspectRatio = computed(() => {
  if (originalH.value === 0) return 1
  return originalW.value / originalH.value
})

// 更新模型值
const updateModelValue = () => {
  modelValue.value = { w: w.value, h: h.value }
}

// 监听宽度变化（等比缩放）
watch(w, (newW) => {
  if (keepAspectRatio.value && newW > 0 && aspectRatio.value > 0) {
    h.value = Math.round(newW / aspectRatio.value)
  }
  updateModelValue()
})

// 监听高度变化（等比缩放）
watch(h, (newH) => {
  if (keepAspectRatio.value && newH > 0 && aspectRatio.value > 0) {
    w.value = Math.round(newH * aspectRatio.value)
  }
  updateModelValue()
})

// 监听宽度百分比变化
watch(percentW, (newPercentW) => {
  if (inputMode.value === 'percent' && hasOriginalSize.value) {
    w.value = Math.round((originalW.value * newPercentW) / 100)
    if (keepAspectRatio.value) {
      percentH.value = newPercentW
      h.value = Math.round((originalH.value * newPercentW) / 100)
    }
    updateModelValue()
  }
})

// 监听高度百分比变化
watch(percentH, (newPercentH) => {
  if (inputMode.value === 'percent' && hasOriginalSize.value) {
    h.value = Math.round((originalH.value * newPercentH) / 100)
    if (keepAspectRatio.value) {
      percentW.value = newPercentH
      w.value = Math.round((originalW.value * newPercentH) / 100)
    }
    updateModelValue()
  }
})

// 监听输入模式变化
watch(inputMode, (newMode) => {
  if (newMode === 'percent' && hasOriginalSize.value) {
    // 切换到百分比模式时，计算当前宽度和高度百分比
    percentW.value = Math.round((w.value / originalW.value) * 100)
    percentH.value = Math.round((h.value / originalH.value) * 100)
  }
})

// 监听原始尺寸变化
watch(
  () => [props.initialW, props.initialH],
  ([newW, newH]) => {
    originalW.value = newW || 0
    originalH.value = newH || 0

    if (keepAspectRatio.value) {
      if (w.value > 0 && aspectRatio.value > 0) {
        h.value = Math.round(w.value / aspectRatio.value)
      } else if (h.value > 0 && aspectRatio.value > 0) {
        w.value = Math.round(h.value * aspectRatio.value)
      }
      updateModelValue()
    }
  },
)

// 还原到原始尺寸
const resetToOriginal = () => {
  if (hasOriginalSize.value) {
    w.value = originalW.value
    h.value = originalH.value
    // 同时重置百分比值为100%
    percentW.value = 100
    percentH.value = 100
    updateModelValue()
  }
}
</script>
