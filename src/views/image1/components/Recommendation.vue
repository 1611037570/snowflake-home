<template>
  <div class="flex flex-col items-center gap-4 p-4">
    <p class="text-sf-secondary text-sm">尝试我们的智能推荐设置：</p>
    <button
      class="w-full rounded-lg bg-sf-theme px-4 py-2 text-sm font-semibold text-sf-primary shadow-md transition-all hover:bg-sf-theme-hover hover:shadow-lg active:scale-[0.98]"
      @click="applyRecommendation"
    >
      一键适配抖音
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  initialW: { type: Number, default: 0 },
  initialH: { type: Number, default: 0 },
})
const emit = defineEmits(['apply'])

const applyRecommendation = () => {
  const targetSize = 2400
  const { initialW, initialH } = props
  const maxDim = Math.max(initialW, initialH)

  let newW = initialW
  let newH = initialH

  // 仅当最大边超过目标尺寸时才进行缩放
  if (maxDim > targetSize) {
    const ratio = targetSize / maxDim
    newW = Math.round(initialW * ratio)
    newH = Math.round(initialH * ratio)
  }

  console.log(`推荐尺寸: ${newW}x${newH}`)
  emit('apply', {
    quality: 1,
    format: 'webp',
    size: { w: newW, h: newH },
  })
}
</script>
