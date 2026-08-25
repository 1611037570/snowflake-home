<script setup>
import { useResumeStore } from "@/stores";
import eventBus from "@/utils/modules/eventBus";
import { storeToRefs } from "pinia";

const resumeStore = useResumeStore();
const { isPrinting } = storeToRefs(resumeStore);

// 点击下载：触发简历 PDF 生成
const handleDownload = () => {
  if (isPrinting.value) return;
  eventBus.emit("resume-print-pdf");
};
</script>

<template>
  <button
    type="button"
    class="flex-c h-9 cursor-pointer gap-1.5 rounded-lg bg-sf-bg px-4 text-sm font-medium text-sf-text transition-all duration-300 hover:bg-sf-theme-2 hover:text-sf-theme active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    :disabled="isPrinting"
    @click="handleDownload"
  >
    <SfIcon v-if="!isPrinting" icon="material-symbols:download" size="4.5" />
    <SfIcon v-else icon="line-md:loading-twotone-loop" size="4.5" class="animate-spin" />
    {{ isPrinting ? "生成中..." : "下载" }}
  </button>
</template>
