<template>
  <Component :is="h(ElUpload, { ...$attrs, ref: changeRef }, $slots)" />
</template>

<script setup lang="ts">
import { ElUpload } from "element-plus";
import type { ComponentInstance } from "vue";
import { getCurrentInstance, h } from "vue";

defineOptions({ name: "SfUpload" });

const vm: any = getCurrentInstance();

function changeRef(exports: any) {
  vm.exposed = exports;
}

defineExpose({} as ComponentInstance<typeof ElUpload>);
</script>

<style scoped></style>
