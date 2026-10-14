<script setup>
defineProps({
  blockRange: { type: Object, default: undefined }, // 当前内容块区间。
  contentRange: { type: Object, default: undefined }, // 当前正文字符区间。
  decoration: { type: String, default: "full" }, // 当前分片装饰位置。
});
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 条目不增加额外边距，日期颜色与页眉强调色一致。 -->
  <div class="resume-item min-w-0" :style="{ '--red-black-date': themeColor }"><slot /></div>
</template>

<style scoped>
.resume-item :deep(.flex.flex-wrap.items-center.justify-between:first-child > .flex.max-w-full) {
  color: var(--red-black-date);
  font-weight: 600;
}
</style>
