<template>
  <ElCollapse v-model="activeNames">
    <ElCollapseItem name="size-adjust">
      <template #title>
        <div class="flex w-full items-center justify-between pr-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">{{ $t('image.sizeAdjust') }}</span>
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
            {{ $t('image.pixel') }}
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
            {{ $t('image.percent') }}
          </button>
        </div>

        <!-- 像素模式（编辑本地值，失焦后提交） -->
        <div v-if="inputMode === 'pixel'" class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-sf-secondary w-8 text-sm">{{ $t('image.width') }}</span>
            <ElInputNumber
              v-model="localW"
              :min="1"
              :max="initialW"
              class="flex-1"
              :placeholder="$t('image.pixelPlaceholder')"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sf-secondary w-8 text-sm">{{ $t('image.height') }}</span>
            <ElInputNumber
              v-model="localH"
              :min="1"
              :max="initialH"
              class="flex-1"
              :placeholder="$t('image.pixelPlaceholder')"
            />
          </div>
        </div>

        <!-- 百分比模式（单输入，失焦后提交） -->
        <div v-else class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-sf-secondary w-8 text-sm">{{ $t('image.ratio') }}</span>
            <ElInputNumber
              v-model="percent"
              :min="1"
              :max="100"
              class="flex-1"
              :placeholder="$t('image.percentPlaceholder')"
            />
          </div>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-xs">{{ $t('image.keepAspect') }}</span>
          <ElSwitch v-model="keepAspectRatio" />
        </div>
      </div>
    </ElCollapseItem>
  </ElCollapse>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

// 定义组件属性：初始宽度和高度
const props = defineProps({
  initialW: { type: Number, default: 0 },
  initialH: { type: Number, default: 0 },
})

// 使用 defineModel 创建双向绑定的尺寸对象 { width, height }
const modelValue = defineModel('modelValue')

// 控制是否保持宽高比（等比缩放）
const keepAspectRatio = ref(true)
// 输入模式：'pixel' 像素模式 或 'percent' 百分比模式
const inputMode = ref('pixel')
// 百分比值（1-100）
const percent = ref(100)
// 控制折叠面板的展开状态
const activeNames = ref(['size-adjust'])

// 本地编辑值（失焦后统一提交到父组件）
const localW = ref(modelValue.value?.width || 0)
const localH = ref(modelValue.value?.height || 0)
// 同步标记，避免联动往返触发
const isSyncing = ref(false)

// 计算属性：检查是否有有效的原始尺寸
const hasOriginalSize = computed(() => props.initialW > 0 && props.initialH > 0)

// 监听百分比变化：按比例更新本地宽高值
watch(percent, (newPercent, oldPercent) => {
  if (inputMode.value === 'percent' && hasOriginalSize.value && newPercent !== oldPercent) {
    localW.value = Math.round((props.initialW * newPercent) / 100)
    localH.value = Math.round((props.initialH * newPercent) / 100)
  }
})

// 监听输入模式变化：同步当前本地值到百分比
watch(inputMode, (newMode) => {
  if (newMode === 'percent' && hasOriginalSize.value) {
    percent.value = Math.round((localW.value / props.initialW) * 100)
  }
})

// 还原到原始尺寸（提交到父组件）
const resetToOriginal = () => {
  if (hasOriginalSize.value) {
    localW.value = props.initialW
    localH.value = props.initialH
    // 同时重置百分比值为100%
    percent.value = 100
    commitSize()
  }
}

// 使用防抖函数优化提交逻辑，避免频繁触发更新
const commitSize = useDebounceFn(() => {
  if (modelValue.value) {
    modelValue.value.width = Number(localW.value) || 0
    modelValue.value.height = Number(localH.value) || 0
  }
}, 450)

// 监听本地值变化，使用防抖函数统一提交
watch([localW, localH, percent], () => {
  commitSize()
})

// 等比缩放联动：合并宽高监听，避免往返触发
watch([localW, localH], ([newW, newH], [oldW, oldH]) => {
  if (
    isSyncing.value ||
    inputMode.value !== 'pixel' ||
    !keepAspectRatio.value ||
    !hasOriginalSize.value
  )
    return

  const ratio = props.initialW / props.initialH
  isSyncing.value = true
  if (newW !== oldW && newW > 0) {
    const nextH = Math.round(newW / ratio)
    if (nextH !== localH.value) localH.value = nextH
  } else if (newH !== oldH && newH > 0) {
    const nextW = Math.round(newH * ratio)
    if (nextW !== localW.value) localW.value = nextW
  }
  isSyncing.value = false
})
</script>
