<template>
  <ElDropdown ref="dropdownRef" v-bind="$attrs" :effect="theme" :trigger="trigger">
    <template #default>
      <slot name="default"></slot>
    </template>
    <template #dropdown>
      <slot name="dropdown"></slot>
    </template>
  </ElDropdown>
</template>

<script setup lang="ts">
import { ElDropdown } from "element-plus";
import type { ComponentInstance } from "vue";
import { provide, ref } from "vue";

import { useThemeStore } from "@/stores";
import { storeToRefs } from "pinia";

// 触发方式默认 hover，可按需传入 click / contextmenu
const props = withDefaults(defineProps<{ trigger?: "hover" | "click" | "contextmenu" }>(), {
  trigger: "hover",
});

defineOptions({ inheritAttrs: false, name: "SfDropdown" });
const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);

// 使用稳定的模板 ref，避免渲染期间通过回调 ref 修改响应式状态。
const dropdownRef = ref<ComponentInstance<typeof ElDropdown>>();
const handleClose = () => dropdownRef.value?.handleClose?.();
// 向下拉内容提供统一关闭方法，列表点击时自动收起当前下拉。
provide("sfDropdownClose", handleClose);
defineExpose({ handleClose });
</script>

<style scoped>
:deep(.el-dropdown__popper .el-dropdown-menu) {
  background-color: red !important;
}
</style>
