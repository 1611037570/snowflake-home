<template>
  <Component
    :is="h(ElScrollbar, { ...$attrs, ref: changeRef }, $slots)"
    class="sf-scrollbar flex h-full flex-1 flex-col"
    :class="{ 'sf-scrollbar--flush': flush }"
  >
    <slot></slot>
  </Component>
</template>

<script setup lang="ts">
import { ElScrollbar } from "element-plus";
import type { ComponentInstance } from "vue";
import { getCurrentInstance, h } from "vue";

defineOptions({ name: "SfScrollbar" });

withDefaults(
  defineProps<{
    /** 关闭滚动内容自带的左右内边距，改由调用方自行控制 */
    flush?: boolean;
  }>(),
  { flush: false },
);

const vm: any = getCurrentInstance();

function changeRef(exports: any) {
  vm.exposed = exports;
}
defineExpose({} as ComponentInstance<typeof ElScrollbar>);
</script>

<style scoped>
:deep(.el-scrollbar__view) {
  height: 100% !important;
  display: flex;
  flex-direction: column;
}

/* 默认保留 12px 左右内边距；flush 时整条规则不参与匹配，内边距完全交给调用方 */
.sf-scrollbar:not(.sf-scrollbar--flush) :deep(.el-scrollbar__view) {
  padding: 0 12px;
}
</style>
