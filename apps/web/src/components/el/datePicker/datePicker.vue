<template>
  <Component
    v-model="value"
    :is="h(ElDatePicker, { ...$attrs, ref: changeRef }, $slots)"
    class="w-full rounded-xl border-none text-sf-text"
    :class="bg"
  />
</template>

<script setup lang="ts">
import { ElDatePicker } from "element-plus";
// 动态导入不生效，手动导入
import "element-plus/theme-chalk/el-date-picker-panel.css";
import type { ComponentInstance } from "vue";
import { getCurrentInstance, h } from "vue";

defineOptions({ name: "SfDatePicker" });

const bg = inject("bg");

const vm: any = getCurrentInstance();
const value = defineModel("modelValue");
function changeRef(exports: any) {
  vm.exposed = exports;
}
defineExpose({} as ComponentInstance<typeof ElDatePicker>);
</script>

<style lang="scss">
:deep(.el-input__wrapper) {
  /* 移除阴影 */
  box-shadow: none;
  /* 移除背景 */
  background-color: transparent !important;
}
</style>
