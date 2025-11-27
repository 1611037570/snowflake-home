<template>
  <div
    class="flex-c relative mr-3 h-full w-full rounded-xl border border-sf-theme-hover bg-sf-primary shadow-md transition-all hover:border-sf-theme hover:shadow-xl"
    ref="containerRef"
  >
    <div
      v-if="isShowImage && (hasImageInfo || label)"
      class="text-sf-basic absolute right-3 bottom-3 z-10 gap-1 space-y-1 rounded bg-sf-transparent px-2 py-1 text-sm shadow backdrop-blur-sm"
    >
      <div
        v-if="label"
        class="flex-c text-sf-basic rounded-full bg-sf-primary-hover px-2 py-0.5 font-bold"
      >
        <span>{{ label }}</span>
      </div>
      <div v-if="originalInfo" class="flex items-center">
        <span class="text-sf-secondary">原图：</span>
        <span>{{ originalInfo }}</span>
      </div>
      <div v-if="renderedInfo" class="flex items-center">
        <span class="text-sf-secondary">显示：</span>
        <span>{{ renderedInfo }}</span>
      </div>
      <div v-if="props.data.format" class="text-sf-secondary flex items-center">
        <span>格式：</span>
        <span>{{ props.data.format.toUpperCase() }}</span>
      </div>
      <div v-if="props.data.size" class="text-sf-secondary flex items-center">
        <span>大小：</span>
        <span>{{ formatFileSize(props.data.size) }}</span>
      </div>
    </div>

    <ElImage
      v-if="props.data.url"
      :src="props.data.url"
      :style="imgStyle"
      @load="isLoading = false"
      @error="isLoading = false"
    />

    <div
      v-if="props.data.url && !isShowImage"
      class="text-sf-secondary flex items-center justify-center text-sm"
    >
      {{ isLoading || isResizing ? '加载中…' : '加载失败' }}
    </div>
  </div>
</template>

<script setup>
import { formatFileSize } from '@/utils'
import { useDebounceFn, useElementSize } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      url: '',
      width: 0,
      height: 0,
      size: 0,
      format: '',
    }),
  },
  label: { type: String, default: '原图' },
  resizeDebounce: { type: Number, default: 100 },
  scalePrecision: { type: Number, default: 0 },
})

const containerRef = ref(null)
const { width: containerW, height: containerH } = useElementSize(containerRef)
const isLoading = ref(false)
const isResizing = ref(false)
const endResize = useDebounceFn(() => (isResizing.value = false), props.resizeDebounce)

const naturalSize = computed(() => ({
  w: props.data.width,
  h: props.data.height,
}))

const hasValidImageData = computed(
  () => props.data.url && naturalSize.value.w > 0 && naturalSize.value.h > 0,
)

watch(
  [() => props.data.url, containerW, containerH],
  ([newUrl, newW, newH], [oldUrl]) => {
    if (newUrl && newUrl !== oldUrl) {
      isResizing.value = false
      isLoading.value = true
    }

    if (hasValidImageData.value && (newW > 0 || newH > 0)) {
      isResizing.value = true
      endResize()
    }
  },
  { immediate: true },
)

const isShowImage = computed(
  () =>
    hasValidImageData.value &&
    containerW.value > 0 &&
    containerH.value > 0 &&
    !isLoading.value &&
    !isResizing.value,
)

const scaleRatio = computed(() => {
  if (!isShowImage.value) return 0
  const availableW = containerW.value - 24
  const availableH = containerH.value - 24
  return Math.min(availableW / naturalSize.value.w, availableH / naturalSize.value.h)
})

const scaleRatioText = computed(() => (scaleRatio.value * 100).toFixed(props.scalePrecision) + '%')

const renderedSize = computed(() => ({
  w: Math.floor(naturalSize.value.w * scaleRatio.value),
  h: Math.floor(naturalSize.value.h * scaleRatio.value),
}))

const hasRenderedInfo = computed(
  () => scaleRatio.value !== 1 && renderedSize.value.w > 0 && renderedSize.value.h > 0,
)

const originalInfo = computed(() =>
  props.data.width && props.data.height ? `${props.data.width}×${props.data.height}` : '',
)

const renderedInfo = computed(() =>
  hasRenderedInfo.value
    ? `${renderedSize.value.w}×${renderedSize.value.h} (${scaleRatioText.value})`
    : '',
)

const hasImageInfo = computed(
  () => !!originalInfo.value || hasRenderedInfo.value || !!props.data.size,
)

const imgStyle = computed(() => {
  if (!isShowImage.value) return { width: '0', height: '0', opacity: 0 }
  const scale = scaleRatio.value
  return {
    width: `${Math.floor(naturalSize.value.w * scale)}px`,
    height: `${Math.floor(naturalSize.value.h * scale)}px`,
    objectFit: 'contain',
    opacity: 1,
  }
})
</script>
