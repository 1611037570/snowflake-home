<script setup>
import { useResumePreviewContext } from "../previewContext";

// 条目标签：跟随首行排布，锁死自身行高避免被主题行高撑高
defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
});
const {
  theme: { fontValue, themeColor, themeColorSoft },
} = useResumePreviewContext();
// 简历主题色与其浅色派生底：标签配色跟随用户选择的主题
</script>

<template>
  <div
    v-for="tag in tags"
    :key="tag"
    :style="[fontValue(-6), { backgroundColor: themeColorSoft, color: themeColor }]"
    class="flex-c rounded-3xl px-2 py-1"
  >
    {{ tag }}
  </div>
</template>

<style lang="scss" scoped></style>
