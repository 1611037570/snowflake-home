<script setup lang="ts">
import { useThemeStore } from "@/stores";
import type { InterviewOutput } from "./types";

withDefaults(defineProps<{
  output: InterviewOutput; // 正文及其真实生成状态。
  id: string; // 页面内唯一标识，传给预览组件时补字母前缀，避免数字开头的非法选择器。
  loadingText?: string; // 尚未返回正文时的当前任务说明。
  compact?: boolean; // 父容器已提供留白时，不再添加正文内边距。
}>(), {
  loadingText: "面试官正在准备下一道题…", // 默认用于逐题面试。
  compact: false, // 默认由正文根容器提供统一留白。
});
const themeStore = useThemeStore();
</script>

<template>
  <div class="interview-output min-w-0 text-sm leading-6" :class="{ 'p-3': !compact }">
    <!-- 留白只由根容器承担，流式、预览和状态提示不再各自叠加内边距。 -->
    <div v-if="output.status === 'generating'" aria-busy="true" aria-live="polite">
      <p v-if="output.content" class="whitespace-pre-wrap break-words text-sf-text">{{ output.content }}</p>
      <p v-else class="flex items-center gap-3 text-sf-text-2" role="status"><SfIcon icon="eos-icons:loading" size="5" class="shrink-0 text-sf-theme" />{{ loadingText }}</p>
    </div>
    <SfMdPreview v-else-if="output.content" :model-value="output.content" :theme="themeStore.theme" :editor-id="`interview-${id}`" class="min-w-0 bg-transparent! text-sm! text-sf-text!" />
    <p v-if="output.status === 'interrupted'" class="flex items-center gap-3 text-xs text-sf-text-2" :class="{ 'mt-3': output.content }"><SfIcon icon="lucide:pause" size="4" />已停止生成{{ output.content ? '，以上为未完成内容。' : '，可以重新生成。' }}</p>
    <p v-if="output.error" class="rounded-xl bg-sf-bg p-3 text-sm text-sf-error" :class="{ 'mt-3': output.content }" role="alert">{{ output.error }}</p>
  </div>
</template>

<style scoped>
/* 所有面试正文统一清除预览自带留白，卡片、弹窗和聊天都只由容器控制间距。 */
.interview-output :deep(.md-editor-previewOnly),
.interview-output :deep(.md-editor-preview-wrapper),
.interview-output :deep(.md-editor-preview) {
  padding: 0 !important;
}
.interview-output :deep(.md-editor-preview) {
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  word-break: break-word;
}
/* 段落、标题和列表共用相同节奏，避免模型生成标题后再次拉大空白。 */
.interview-output :deep(.md-editor-preview :is(p, h1, h2, h3, h4, h5, h6, ul, ol, pre, blockquote, table)) {
  margin-block: 12px;
}
.interview-output :deep(.md-editor-preview > :first-child) {
  margin-top: 0 !important;
}
.interview-output :deep(.md-editor-preview > :last-child) {
  margin-bottom: 0 !important;
}
</style>
