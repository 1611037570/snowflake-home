<template>
  <Component :is="h(ElImage, { ...$attrs, ref: changeRef }, $slots)" />
</template>

<script setup lang="ts">
import { ElImage } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { getCurrentInstance, h } from 'vue'
const vm: any = getCurrentInstance()

function changeRef(exports: any) {
  vm.exposed = exports
}
defineExpose({} as ComponentInstance<typeof ElImage>)
</script>

<style scoped></style>
