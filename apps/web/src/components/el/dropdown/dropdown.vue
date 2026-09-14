<template>
  <Component
    :is="h(ElDropdown, { ...$attrs, ref: changeRef }, $slots)"
    :effect="theme"
    :trigger="trigger"
  >
    <template #default>
      <slot name="default"></slot>
    </template>
    <template #dropdown>
      <slot name="dropdown"></slot>
    </template>
  </Component>
</template>

<script setup lang="ts">
import { ElDropdown } from "element-plus";
import type { ComponentInstance } from "vue";
import { getCurrentInstance, h, provide, ref } from "vue";

import { useThemeStore } from "@/stores";
import { storeToRefs } from "pinia";

// 触发方式默认 hover，可按需传入 click / contextmenu
const props = withDefaults(defineProps<{ trigger?: "hover" | "click" | "contextmenu" }>(), {
  trigger: "hover",
});

defineOptions({ name: "SfDropdown" });
const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);

const vm: any = getCurrentInstance();
const dropdownRef = ref<ComponentInstance<typeof ElDropdown>>();

function changeRef(exports: any) {
  dropdownRef.value = exports;
  vm.exposed = exports;
}
// 向下拉内容提供统一关闭方法，列表点击时自动收起当前下拉。
provide("sfDropdownClose", () => dropdownRef.value?.handleClose?.());
defineExpose({} as ComponentInstance<typeof ElDropdown>);
</script>

<style scoped>
:deep(.el-dropdown__popper .el-dropdown-menu) {
  background-color: red !important;
}
</style>
