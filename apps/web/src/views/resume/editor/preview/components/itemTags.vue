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
// 标签保留主题浅底色，文字继承简历正文色以保证浅色主题下可读。
</script>

<template>
  <div
    v-for="tag in tags"
    :key="tag"
    :style="[fontValue(-6), { backgroundColor: themeColorSoft }]"
    class="flex-c shrink-0 whitespace-nowrap rounded-3xl px-2 py-1"
  >
    {{ tag }}
  </div>
</template>

<style lang="scss" scoped></style>
