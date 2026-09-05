<template>
  <Component :is="h(ElCollapseItem, { ...$attrs, ref: changeRef }, $slots)" class="w-full" />
</template>

<script setup lang="ts">
import { ElCollapseItem } from "element-plus";
import type { ComponentInstance } from "vue";
import { getCurrentInstance, h } from "vue";

defineOptions({ name: "SfCollapseItem" });
const vm: any = getCurrentInstance();

function changeRef(exports: any) {
  vm.exposed = exports;
}
defineExpose({} as ComponentInstance<typeof ElCollapseItem>);
</script>

<style scoped></style>
