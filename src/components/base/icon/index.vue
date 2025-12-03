<template>
  <div
    class="flex-c relative cursor-pointer overflow-hidden transition-all duration-300"
    :class="boxSizeClass"
  >
    <Icon ref="iconify" :icon="icon" class="bg-transparent" :class="iconClass" />
  </div>
  <!-- class="iconify-icon"
     :rotate="rotate"
      :flip="flip" -->
</template>

<script setup lang="ts">
import { ICON_LIST } from '@/constants'
import { Icon, loadIcon } from '@iconify/vue'

export interface IconProps {
  /**
   * Iconify 图标名称
   */
  icon?: string

  /**
   * 图标大小
   */
  size?: number | string
  /**
   * 图标盒子大小
   */
  boxSize?: number | string

  /**
   * 图标旋转角度
   */
  rotate?: number
  /**
   * 图标翻转方向
   */
  flip?: 'horizontal' | 'vertical'
}
function sizeConvert(size: number | string) {
  const res = Number(size)
  const defaultSize = res - 4 >= 4 ? res - 4 : 4
  const mdSize = res
  return `min-w-${defaultSize} min-h-${defaultSize} w-${defaultSize} h-${defaultSize} md:w-${mdSize} md:h-${mdSize}`
}
const boxSizeClass = computed(() => {
  return sizeConvert(props.boxSize || props.size)
})
const props = withDefaults(defineProps<IconProps>(), {
  icon: 'fa6-solid:snowflake',
  size: 16,
  rotate: 180,
  flip: 'horizontal',
})
const emit = defineEmits(['success', 'fail'])
function init() {
  const item = ICON_LIST[props.icon]
  if (!item) {
    emit('fail')
    return
  }
  loadIcon(item.icon)
    .then(() => {
      emit('success')
    })
    .catch(() => {
      emit('fail')
    })
}
init()
const iconClass = computed(() => {
  return sizeConvert(props.size)
})
</script>
<style scoped></style>
