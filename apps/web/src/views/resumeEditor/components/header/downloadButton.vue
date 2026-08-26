<script setup>
import { useResumeStore } from "@/stores";
import eventBus from "@/utils/modules/eventBus";
import { storeToRefs } from "pinia";

const resumeStore = useResumeStore();
const { currentConfig, isPrinting } = storeToRefs(resumeStore);

// 点击下载：触发简历 PDF 生成
const handleDownload = () => {
  if (isPrinting.value) return;
  eventBus.emit("resume-print-pdf");
};

// 导出当前简历配置为 JSON 文件
const handleExportConfig = () => {
  const json = JSON.stringify(currentConfig.value ?? {}, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "resume-config.json";
  link.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      type="button"
      class="flex-c h-9 cursor-pointer gap-1.5 rounded-3xl border border-sf-b bg-sf-page px-4 text-sm font-medium text-sf-text transition-all duration-300 hover:bg-sf-theme-2 hover:text-sf-theme active:scale-95"
      @click="handleExportConfig"
    >
      <SfIcon icon="material-symbols:settings" size="4.5" />
      导出配置
    </button>
    <button
      type="button"
      class="flex-c h-9 cursor-pointer gap-1.5 rounded-3xl border border-sf-b bg-sf-page px-4 text-sm font-medium text-sf-text transition-all duration-300 hover:bg-sf-theme-2 hover:text-sf-theme active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="isPrinting"
      @click="handleDownload"
    >
      <SfIcon v-if="!isPrinting" icon="material-symbols:download" size="4.5" />
      <SfIcon v-else icon="line-md:loading-twotone-loop" size="4.5" class="animate-spin" />
      {{ isPrinting ? "生成中..." : "下载" }}
    </button>
  </div>
</template>
