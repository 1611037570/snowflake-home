<script setup>
// 工具栏「一页纸」：发送事件，智能一页的计算与参数应用由预览层实例内部完成
import eventBus from "@/utils/modules/eventBus";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";

const resumeStore = useResumeStore();
const { isFittingOnePage } = storeToRefs(resumeStore);

// 点击执行：通知编辑器预览实例执行智能一页
const onFitOnePage = () => {
  if (isFittingOnePage.value) return;
  eventBus.emit("resume-smart-one-page");
};
</script>

<template>
  <!-- 智能一页名称常驻显示，避免依赖悬停提示才能识别功能。 -->
  <button
    type="button"
    class="flex h-6 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2 text-[11px] text-sf-text-2 transition-colors hover:bg-sf-bg disabled:cursor-wait disabled:text-sf-theme"
    :disabled="isFittingOnePage"
    :aria-busy="isFittingOnePage"
    @click="onFitOnePage"
  >
    <SfIcon v-if="isFittingOnePage" icon="line-md:loading-twotone-loop" size="4" />
    <!-- 文档图标直接表达简历处理 -->
    <SfIcon v-else icon="mdi:file-document-outline" size="4" />
    <span class="whitespace-nowrap">
      {{ isFittingOnePage ? $t("compressingOnePage") : $t("smartOnePage") }}
    </span>
  </button>
</template>
