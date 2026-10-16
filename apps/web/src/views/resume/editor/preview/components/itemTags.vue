<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "../shared/previewContext";

// 条目标签：跟随首行排布，锁死自身行高避免被主题行高撑高
defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
});
const {
  theme: { fontValue, themeColor },
} = useResumePreviewContext();
// 标签使用不透明浅底和深色文字，避免随所在主题继承低对比度颜色。
const tagStyle = computed(() => ({
  fontSize: `max(12px, ${fontValue.value(-2).fontSize})`, // 小字号主题下仍保持可读。
  backgroundColor: `color-mix(in srgb, ${themeColor.value} 12%, white)`, // 浅色底独立于栏背景。
  color: "#2e2e2e", // 深色文字在浅底上保持对比度。
  borderColor: `color-mix(in srgb, ${themeColor.value} 30%, #999999)`, // 浅色页面上保留标签轮廓。
}));
</script>

<template>
  <div
    v-for="tag in tags"
    :key="tag"
    :style="tagStyle"
    class="flex-c shrink-0 whitespace-nowrap rounded-3xl border px-2 py-1"
  >
    {{ tag }}
  </div>
</template>

<style lang="scss" scoped></style>
