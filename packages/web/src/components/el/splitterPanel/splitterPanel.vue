<template>
  <Component :is="h(ElSplitterPanel, { ...$attrs, ref: changeRef }, $slots)" />
</template>

<script setup lang="ts">
import { ElSplitterPanel } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { getCurrentInstance, h } from 'vue'

defineOptions({ name: 'SfSplitterPanel' })

const vm: any = getCurrentInstance()

function changeRef(exports: any) {
  vm.exposed = exports
}
defineExpose({} as ComponentInstance<typeof ElSplitterPanel>)
</script>

<style scoped></style>
