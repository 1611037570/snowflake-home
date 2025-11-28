<template>
  <ElImage v-if="type === 'img'" :src="value" :style="autoImgStyle" />
  <BaseIcon v-else-if="type === 'icon'" :icon="value" :style="autoImgStyle" />
  <div v-else-if="type === 'str'" :style="autoImgStyle" class="flex-c">
    {{ (value && value[0]) || '' }}
  </div>
</template>

<script setup>
const { size } = defineProps({
  /**
   * 图片类型
   */
  type: {
    type: String,
    default: 'img',
  },
  /**
   * 图片值
   */
  value: {
    type: String,
    default: '',
  },
  size: {
    type: Number,
    default: 24,
  },
})
const autoImgStyle = computed(() => ({
  width: `${size}px`,
  height: `${size}px`,
  fontSize: `${size * 0.8}px`,
}))
</script>
