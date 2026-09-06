<template>
  <Component
    v-model="value"
    :is="h(ElCascader, { ...$attrs, ref: changeRef }, $slots)"
    class="w-full rounded-3xl border-none text-sf-text"
    :class="bg"
  />
</template>

<script setup lang="ts">
import { ElCascader } from "element-plus";
// 级联面板样式与输入框分离，按需引入面板样式
import "element-plus/theme-chalk/el-cascader-panel.css";
import type { ComponentInstance } from "vue";
import { getCurrentInstance, h } from "vue";

defineOptions({ name: "SfCascader" });

const bg = inject("bg");

const vm: any = getCurrentInstance();
const value = defineModel("modelValue");

function changeRef(exports: any) {
  vm.exposed = exports;
}
defineExpose({} as ComponentInstance<typeof ElCascader>);
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
</style>
