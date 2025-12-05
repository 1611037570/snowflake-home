<template>
  <div
    class="flex-c relative cursor-pointer overflow-hidden transition-all duration-300"
    :class="[$s(boxSize || size, 'w'), $s(boxSize || size, 'h')]"
  >
    <Icon ref="iconify" :icon="icon" class="bg-transparent" :class="[$s(size)]" />
  </div>
  <!-- class="iconify-icon"
         :rotate="rotate"
      :flip="flip"
   -->
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

const props = withDefaults(defineProps<IconProps>(), {
  icon: 'fa6-solid:snowflake',
  size: 16,
  rotate: 180,
  flip: 'vertical',
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
</script>
<style scoped></style>
