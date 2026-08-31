<template>
  <Component
    class="rounded-3xl text-sf-text"
    :class="bg"
    spellcheck="false"
    :is="h(ElInputNumber, { ...$attrs, ref: changeRef }, $slots)"
  />
</template>

<script setup lang="ts">
import { ElInputNumber } from "element-plus";
import type { ComponentInstance } from "vue";
import { getCurrentInstance, h } from "vue";

defineOptions({ name: "SfInputNumber" });

const bg = inject("bg");
const vm: any = getCurrentInstance();

function changeRef(exports: any) {
  vm.exposed = exports;
}
defineExpose({} as ComponentInstance<typeof ElInputNumber>);
</script>

<style scoped lang="scss">
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
  /* color: var(--color-sf-text); */
}

:deep(.el-input-number__decrease) {
  border-radius: 16px 0 0 16px !important;
}
:deep(.el-input-number__increase) {
  border-radius: 0 16px 16px 0 !important;
}
</style>
