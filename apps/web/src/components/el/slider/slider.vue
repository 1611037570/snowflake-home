<template>
  <Component :is="h(ElSlider, { ...$attrs, ref: changeRef }, $slots)" class="flex-1" />
</template>

<script setup lang="ts">
import { ElSlider } from "element-plus";
import type { ComponentInstance } from "vue";
import { getCurrentInstance, h } from "vue";

defineOptions({ name: "SfSlider" });

const vm: any = getCurrentInstance();

function changeRef(exports: any) {
  vm.exposed = exports;
}
defineExpose({} as ComponentInstance<typeof ElSlider>);
</script>

<style scoped></style>
