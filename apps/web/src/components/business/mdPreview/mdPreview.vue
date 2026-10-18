<template>
  <MdPreview v-bind="$attrs" />
</template>

<script setup>
import { defineAsyncComponent } from "vue";

defineOptions({ name: "SfMdPreview", inheritAttrs: false });

// 延迟加载 md-editor-v3 预览组件及样式：按需使用时才引入，避免主包体积过大
const MdPreview = defineAsyncComponent(() =>
  import("md-editor-v3/lib/preview.css").then(() =>
    import("md-editor-v3").then((m) => m.MdPreview),
  ),
);
</script>

<style lang="scss" scoped>
.md-editor-preview h1 {
  margin: 0.8rem 0 !important;
}
</style>
