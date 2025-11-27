<template>
  <div class="h-full w-full px-2">
    <div
      class="flex-c relative h-full w-full rounded-xl border border-sf-theme-hover bg-sf-primary transition-all hover:border-sf-theme hover:shadow-sm"
      ref="containerRef"
    >
      <div
        v-if="isShowImage"
        class="text-sf-basic absolute right-3 bottom-3 z-10 gap-1 space-y-1 rounded bg-sf-transparent px-2 py-1 text-sm shadow backdrop-blur-sm"
      >
        <div
          v-if="label"
          class="flex-c text-sf-basic rounded-full bg-sf-primary-hover px-2 py-0.5 font-bold"
        >
          <span>{{ label }}</span>
        </div>
        <div v-if="originalInfo" class="flex items-center">
          <span class="text-sf-secondary">{{ $t('image.actual') }}</span>
          <span>{{ originalInfo }}</span>
        </div>
        <div v-if="renderedInfo" class="flex items-center">
          <span class="text-sf-secondary">{{ $t('image.displayed') }}</span>
          <span>{{ renderedInfo }}</span>
        </div>
        <div v-if="props.data.format" class="text-sf-secondary flex items-center">
          <span>{{ $t('image.format') }}</span>
          <span>{{ props.data.format.toUpperCase() }}</span>
        </div>
        <div v-if="props.data.size" class="text-sf-secondary flex items-center">
          <span>{{ $t('image.size') }}</span>
          <span>{{ formatFileSize(props.data.size) }}</span>
        </div>
      </div>

      <ElImage
        :preview-src-list="[props.data.url]"
        show-progress
        v-if="props.data.url"
        :src="props.data.url"
        :style="imgStyle"
        :lazy="true"
        @load="isLoading = false"
        @error="isLoading = false"
      />

      <div
        v-if="props.data.url && !isShowImage"
        class="text-sf-secondary flex items-center justify-center text-sm"
      >
        {{ isLoading || isResizing ? $t('image.loading') : $t('image.loadFailed') }}
      </div>
    </div>
  </div>
</template>

<script setup>
// 导入工具函数和 VueUse 组合式 API
import { formatFileSize } from '@/utils'
import { useDebounceFn, useElementSize } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

// 定义组件属性：图片数据、标签、调整防抖时间和缩放精度
const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      url: '', // 图片 URL
      width: 0, // 图片原始宽度
      height: 0, // 图片原始高度
      size: 0, // 文件大小（字节）
      format: '', // 图片格式
    }),
  },
  label: { type: String, default: '' }, // 预览标签
  resizeDebounce: { type: Number, default: 200 }, // 调整防抖时间（毫秒）
  scalePrecision: { type: Number, default: 0 }, // 缩放比例显示精度
})

// 容器引用和尺寸监听
const containerRef = ref(null)
const { width: containerW, height: containerH } = useElementSize(containerRef)

// 加载和调整状态
const isLoading = ref(false) // 图片加载中状态
const isResizing = ref(false) // 容器调整中状态

// 防抖函数：延迟结束调整状态
const endResize = useDebounceFn(() => (isResizing.value = false), props.resizeDebounce)

// 计算属性：图片原始尺寸
const naturalSize = computed(() => ({
  w: props.data.width,
  h: props.data.height,
}))

// 计算属性：检查是否有有效的图片数据
const hasValidImageData = computed(
  () => props.data.url && naturalSize.value.w > 0 && naturalSize.value.h > 0,
)

// 监听图片 URL 和容器尺寸变化
watch(
  [() => props.data.url, containerW, containerH],
  ([newUrl, newW, newH], [oldUrl]) => {
    if (newUrl && newUrl !== oldUrl) {
      // 图片 URL 变化：重置调整状态，开始加载
      isResizing.value = false
      isLoading.value = true
    }

    if (hasValidImageData.value && (newW > 0 || newH > 0)) {
      // 有效图片数据且容器尺寸变化：标记为调整中状态
      isResizing.value = true
      endResize() // 触发防抖结束
    }
  },
  { immediate: true }, // 立即执行一次以初始化状态
)

// 计算属性：是否显示图片（满足所有条件）
const isShowImage = computed(
  () =>
    hasValidImageData.value && // 有有效图片数据
    containerW.value > 0 && // 容器宽度有效
    containerH.value > 0 && // 容器高度有效
    !isLoading.value && // 不在加载中
    !isResizing.value, // 不在调整中
)

// 计算属性：图片缩放比例（自适应容器）
const scaleRatio = computed(() => {
  if (!isShowImage.value) return 0
  const availableW = containerW.value - 24 // 可用宽度（减去内边距）
  const availableH = containerH.value - 24 // 可用高度（减去内边距）
  // 计算最小缩放比例（保持宽高比）
  return Math.min(availableW / naturalSize.value.w, availableH / naturalSize.value.h)
})

// 计算属性：缩放比例文本显示
const scaleRatioText = computed(() => (scaleRatio.value * 100).toFixed(props.scalePrecision) + '%')

// 计算属性：渲染后的实际尺寸
const renderedSize = computed(() => ({
  w: Math.floor(naturalSize.value.w * scaleRatio.value),
  h: Math.floor(naturalSize.value.h * scaleRatio.value),
}))

// 计算属性：是否有渲染信息（缩放且尺寸有效）
const hasRenderedInfo = computed(
  () => scaleRatio.value !== 1 && renderedSize.value.w > 0 && renderedSize.value.h > 0,
)

// 计算属性：原始尺寸信息文本
const originalInfo = computed(() =>
  props.data.width && props.data.height ? `${props.data.width}×${props.data.height}` : '',
)

// 计算属性：渲染尺寸信息文本（包含缩放比例）
const renderedInfo = computed(() =>
  hasRenderedInfo.value
    ? `${renderedSize.value.w}×${renderedSize.value.h} (${scaleRatioText.value})`
    : '',
)

// 计算属性：图片样式（自适应缩放）
const imgStyle = computed(() => {
  if (!isShowImage.value) return { width: '0', height: '0', opacity: 0 }
  const scale = scaleRatio.value
  return {
    width: `${Math.floor(naturalSize.value.w * scale)}px`,
    height: `${Math.floor(naturalSize.value.h * scale)}px`,
    objectFit: 'contain', // 保持宽高比，包含在容器内
    opacity: 1,
  }
})
</script>
