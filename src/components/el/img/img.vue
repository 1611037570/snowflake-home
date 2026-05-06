<template>
  <Component :is="h(ElImage, { ...$attrs, ref: changeRef }, $slots)" :style="[getSizeStyle]" />
</template>

<script setup lang="ts">
import { ElImage } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { getCurrentInstance, h } from 'vue'

defineOptions({ name: 'SfImg' })

const props = defineProps({
  size: {
    type: Number,
    default: 0,
  },
})
const getSizeStyle = computed(() => {
  return {
    width: `${props.size * 4}px`,
    height: `${props.size * 4}px`,
  }
})
const vm: any = getCurrentInstance()

function changeRef(exports: any) {
  vm.exposed = exports
}
defineExpose({} as ComponentInstance<typeof ElImage>)
</script>

<style scoped></style>
