<template>
  <Component
    class="text-sf-text"
    spellcheck="false"
    :is="h(ElInput, { ...$attrs, ref: changeRef }, $slots)"
  />
</template>

<script setup lang="ts">
import { ElInput } from 'element-plus'
import type { ComponentInstance } from 'vue'
import { getCurrentInstance, h } from 'vue'
const vm = getCurrentInstance()

function changeRef(exports) {
  vm.exposed = exports
}
defineExpose({} as ComponentInstance<typeof ElInput>)
</script>

<style scoped>
/* 输入框容器 */
:deep(.el-input__wrapper) {
  /* 移除阴影 */
  box-shadow: none;
  /* 移除背景 */
  background-color: transparent;
}

/* 输入框文本 */
:deep(.el-input__inner) {
  /* 更改文本颜色 */
  color: var(--color-sf-text);
}
/* 输入框占位符 */
:deep(.el-input__inner::placeholder) {
  /* 更改占位符颜色 */
  color: var(--color-sf-text);
}
</style>
