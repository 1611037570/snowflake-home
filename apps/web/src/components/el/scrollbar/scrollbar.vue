<template>
  <Component :is="h(ElScrollbar, { ...$attrs, ref: changeRef }, $slots)" class="flex-1">
    <div class="overflow-hidden px-3">
      <slot></slot>
    </div>
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

<style scoped></style>
