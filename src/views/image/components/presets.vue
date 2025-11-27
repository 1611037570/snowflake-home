<template>
  <div class="w-full gap-3" v-if="init && options.length">
    <template v-for="opt in options" :key="opt.value">
      <div
        v-if="opt.value <= maxSize"
        class="mb-3 flex w-full items-center justify-between rounded-lg bg-sf-theme px-4 py-3 text-sm font-semibold text-sf-primary shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
        :class="
          selected === opt.name
            ? 'hover:bg-sf-theme-hover'
            : 'border-l-4 border-sf-primary bg-sf-theme-hover'
        "
        @click="applyRecommendation(opt.value)"
      >
        <span>{{ opt.name }}</span>
      </div>
    </template>
  </div>
  <div v-else class="flex-c">{{ $t('image.noRecommendation') }}</div>
</template>

<script setup>
// 定义组件属性：初始宽度和高度
const props = defineProps({
  initialW: { type: Number },
  initialH: { type: Number },
})

// 定义组件事件：应用推荐设置
const emit = defineEmits(['apply'])

const options = computed(() => {
  return [
    { name: $t('image.rec2k'), value: 2560 },
    { name: $t('image.rec1080p'), value: 1920 },
  ]
})
const maxSize = computed(() => {
  return Math.max(props.initialW, props.initialH)
})
const selected = ref('')
const init = ref(false)
onMounted(async () => {
  await nextTick()
  init.value = true
})

// 应用推荐设置：抖音高清优化方案
const applyRecommendation = (size) => {
  const targetSize = size // 目标最大尺寸（抖音推荐尺寸）
  const { initialW, initialH } = props
  const maxDim = Math.max(initialW, initialH) // 获取最大边长

  let newW = initialW
  let newH = initialH

  // 仅当最大边超过目标尺寸时才进行缩放（避免小图放大）
  if (maxDim > targetSize) {
    const ratio = targetSize / maxDim // 计算缩放比例
    newW = Math.round(initialW * ratio)
    newH = Math.round(initialH * ratio)
  }

  // 触发应用事件，传递推荐设置
  emit('apply', {
    quality: 1, // 无损质量
    format: 'webp', // WebP格式（抖音推荐）
    size: { w: newW, h: newH }, // 优化后的尺寸
  })

  const name = options.value.find((o) => o.value === size).name
  selected.value = name
}
</script>
