<template>
  <Component :is="h(ElCollapse, { ...$attrs, ref: changeRef }, $slots)" class="w-full" />
</template>

<script setup lang="ts">
import { ElCollapse } from "element-plus";
import type { ComponentInstance } from "vue";
import { getCurrentInstance, h } from "vue";
const props = defineProps({
  border: {
    type: Boolean,
    default: true,
  },
});
defineOptions({ name: "SfCollapse" });

const vm: any = getCurrentInstance();

function changeRef(exports: any) {
  vm.exposed = exports;
}
const isBorder = computed(() => (props.border ? "1px solid var(--sf-border)" : "none"));
defineExpose({} as ComponentInstance<typeof ElCollapse>);
</script>

<style scoped lang="scss">
//
.el-collapse {
  border: none !important;
  border-bottom: v-bind(isBorder) !important;
}
:deep(.el-collapse-item__header) {
  border: none !important;
  height: 40px !important;
  line-height: 40px !important;
}
//
:deep(.el-collapse-item__wrap) {
  border: none !important;
}
</style>
