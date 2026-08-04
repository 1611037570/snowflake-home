<template>
  <!-- 图片类型 -->
  <SfImg v-if="type === 'img'" :size="size" :src="value" :style="autoImgStyle" />
  <!-- 图标类型 -->
  <SfIcon v-else-if="type === 'icon'" :size="size" :icon="value" />
  <!-- 组件类型 -->
  <component v-else-if="type === 'component'" :size="size" :is="value" />
  <!-- 字符串类型 -->
  <div v-else-if="type === 'str'" :style="autoImgStyle" class="flex-c">
    {{ (value && value[0]) || '' }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({ name: 'SfMixImg' })

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
    type: [String, Object, Function],
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
