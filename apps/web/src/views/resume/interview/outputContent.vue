<script setup lang="ts">
import { useThemeStore } from "@/stores";
import type { InterviewOutput } from "./types";

withDefaults(defineProps<{
  output: InterviewOutput; // 正文及其真实生成状态。
  id: string; // 页面内唯一的预览标识。
  loadingText?: string; // 尚未返回正文时的当前任务说明。
}>(), {
  loadingText: "面试官正在准备下一道题…", // 默认用于逐题面试。
});
const themeStore = useThemeStore();
</script>

<template>
  <div class="min-w-0 text-sm leading-6">
    <!-- 流式阶段使用轻量文本，完成后再渲染完整 Markdown。 -->
    <p v-if="output.status === 'generating'" class="whitespace-pre-wrap break-words text-sf-text" aria-live="polite">{{ output.content || loadingText }}</p>
    <SfMdPreview v-else-if="output.content" :model-value="output.content" :theme="themeStore.theme" :editor-id="id" class="min-w-0 bg-transparent! p-3! text-sm! text-sf-text!" />
    <p v-if="output.status === 'interrupted'" class="mt-3 text-xs text-sf-text-2">已停止生成，以上为未完成内容。</p>
    <p v-if="output.error" class="mt-3 rounded-xl bg-sf-bg p-3 text-sm text-sf-error" role="alert">{{ output.error }}</p>
  </div>
</template>
