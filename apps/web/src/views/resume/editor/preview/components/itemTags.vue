<script setup>
import { useResumePreviewContext } from "../shared/previewContext";

// 条目标签：跟随首行排布，锁死自身行高避免被主题行高撑高
defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
});
const {
  theme: { fontValue, themeColorSoft },
} = useResumePreviewContext();
// 标签默认使用主题浅底色，深色主题可通过配色变量提供可读的底色与文字色。
</script>

<template>
  <div
    v-for="tag in tags"
    :key="tag"
    :style="[fontValue(-2), { backgroundColor: `var(--resume-tag-background, ${themeColorSoft})`, color: 'var(--resume-tag-color, inherit)' }]"
    class="flex-c shrink-0 whitespace-nowrap rounded-3xl px-2 py-1"
  >
    {{ tag }}
  </div>
</template>

<style lang="scss" scoped></style>
