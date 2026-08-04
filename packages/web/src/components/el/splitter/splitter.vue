<template>
  <Component :is="h(ElSplitter, { ...$attrs, ref: changeRef }, $slots)" />
</template>

<script setup lang="ts">
import { ElSplitter } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { getCurrentInstance, h } from 'vue'

defineOptions({ name: 'SfSplitter' })

const vm: any = getCurrentInstance()

function changeRef(exports: any) {
  vm.exposed = exports
}
defineExpose({} as ComponentInstance<typeof ElSplitter>)
</script>

<style scoped></style>
