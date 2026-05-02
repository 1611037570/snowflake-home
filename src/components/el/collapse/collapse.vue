<template>
  <Component :is="h(ElCollapse, { ...$attrs, ref: changeRef }, $slots)" class="w-full" />
</template>

<script setup lang="ts">
import { ElCollapse } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { getCurrentInstance, h } from 'vue'

defineOptions({ name: 'SfCollapse' })

const vm: any = getCurrentInstance()

function changeRef(exports: any) {
  vm.exposed = exports
}
defineExpose({} as ComponentInstance<typeof ElCollapse>)
</script>

<style scoped lang="scss">
//
.el-collapse {
  border: none !important;
}
:deep(.el-collapse-item__header) {
  border: none !important;
}
//
:deep(.el-collapse-item__wrap) {
  border: none !important;
}
</style>
