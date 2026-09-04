<template>
  <Component
    :is="h(ElScrollbar, { ...$attrs, ref: changeRef }, $slots)"
    class="flex h-full flex-1 flex-col"
  >
    <slot></slot>
    <!-- <div class="min-h-full! overflow-hidden px-3">
    </div> -->
  </Component>
</template>

<script setup lang="ts">
import { ElScrollbar } from "element-plus";
import type { ComponentInstance } from "vue";
import { getCurrentInstance, h } from "vue";

defineOptions({ name: "SfScrollbar" });

const vm: any = getCurrentInstance();

function changeRef(exports: any) {
  vm.exposed = exports;
}
defineExpose({} as ComponentInstance<typeof ElScrollbar>);
</script>

<style scoped>
:deep(.el-scrollbar__view) {
  height: 100% !important;
  padding: 0 12px !important;
  display: flex;
  flex-direction: column;
}
</style>
