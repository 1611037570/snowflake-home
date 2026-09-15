<script setup>
import { useResumeStore } from "@/stores";
import { getExportFileName, resumeTitle } from "../../../resumeName.ts";
import eventBus from "@/utils/modules/eventBus";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import ExportItem from "./exportItem.vue";

const visible = ref(false);
// 默认使用标准 1x，导出弹窗中可切换更高清晰度
const exportScale = ref(1);
const exportScaleList = [
  { name: "1x", value: 1 },
  { name: "2x", value: 2 },
  { name: "4x", value: 4 },
  { name: "8x", value: 8 },
];
// 根据倍率提示导出耗时和资源占用
const exportScaleTip = computed(() => {
  if (exportScale.value === 8) {
    return {
      class: "text-sf-error",
      text: "最高清晰度，导出很慢，占用大量内存，可能失败或崩溃。",
    };
  }
  if (exportScale.value === 4) {
    return {
      class: "text-sf-error",
      text: "最清晰，导出慢，占用较多内存，可能失败或崩溃。",
    };
  }
  if (exportScale.value === 2) {
    return {
      class: "text-sf-warning",
      text: "更清晰，导出速度稍慢。",
    };
  }
  return {
    class: "text-sf-text-2",
    text: "清晰度正常，导出速度快。",
  };
});
const resumeStore = useResumeStore();
const { currentItem, isPrinting } = storeToRefs(resumeStore);
const pdfExportType = ref("local");
const longImageExportType = ref("png");

const pdfExportOptions = [
  { name: "本地", value: "local" },
  { name: "服务器", value: "server" },
];
const longImageExportOptions = [
  { name: "PNG", value: "png" },
  { name: "PDF图片", value: "pdf" },
];

// 导出当前完整简历为 JSON 文件（data/config/ui），支持无损导入恢复
const exportConfig = () => {
  const json = JSON.stringify(currentItem.value ?? {}, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  // 统一命名：年-月-日-简历标题（标题取自简历数据，非配置）
  link.download = getExportFileName(resumeTitle.value, "json");
  link.click();
  URL.revokeObjectURL(url);
};

// 统一通过事件总线触发编辑器中的导出 hooks；点击导出后关闭弹窗，加载浮层全屏展示
const emitExport = (eventName) => {
  if (isPrinting.value) return;
  visible.value = false;
  eventBus.emit(eventName, exportScale.value);
};

// PDF 和长图分别合并导出来源与文件类型，减少菜单入口数量。
const list = computed(() => [
  {
    name: "PDF",
    icon: "mdi:file-pdf-box",
    desc: "本地或服务器排版导出",
    options: pdfExportOptions,
    modelValue: pdfExportType.value,
    onChange: (value) => (pdfExportType.value = value),
    fn: () =>
      emitExport(
        pdfExportType.value === "server" ? "resume-print-server-pdf" : "resume-print-browser-pdf",
      ),
  },
  {
    name: "长图",
    icon: "material-symbols:image-outline",
    desc: "PNG 或 PDF图片，适合快速分享",
    options: longImageExportOptions,
    modelValue: longImageExportType.value,
    onChange: (value) => (longImageExportType.value = value),
    scale: {
      options: exportScaleList,
      modelValue: exportScale.value,
      tip: exportScaleTip.value,
      onChange: (value) => (exportScale.value = value),
    },
    fn: () =>
      emitExport(
        longImageExportType.value === "pdf" ? "resume-print-pdf" : "resume-print-image",
      ),
  },
  {
    name: "Markdown",
    icon: "mdi:language-markdown",
    desc: "适合编辑和分享的文本",
    fn: () => emitExport("resume-print-markdown"),
  },
  {
    name: "HTML",
    icon: "mdi:language-html5",
    desc: "适合编辑和分享的网页",
    fn: () => emitExport("resume-print-html"),
  },
]);
const a = {
  name: "JSON",
  icon: "mdi:file-code-outline",
  desc: "适合备份和恢复的完整简历数据",
  fn: () => {
    // 导出配置后关闭弹窗
    visible.value = false;
    exportConfig();
  },
};
</script>

<template>
  <div
    @click="visible = true"
    class="flex h-9 cursor-pointer items-center gap-1 rounded-3xl border border-sf-b bg-sf-page p-1 px-2 text-sm transition-colors hover:bg-sf-theme hover:text-white"
  >
    <SfIcon icon="material-symbols:download" size="4" />
    <span> 导出简历 </span>
    <SfIcon icon="mingcute:down-line" size="4" />
  </div>

  <SfModal v-model="visible" title="导出简历">
    <div class="flex w-[600px] max-w-[90vw] flex-col gap-6">
      <div>
        <div class="text-lg font-bold">导出格式</div>
        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ExportItem v-for="item in list" :key="item.name" :item="item" @click="item.fn" />
        </div>

      </div>

      <div>
        <div class="text-lg font-bold">简历配置</div>
        <ExportItem :item="a" @click="a.fn" />
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
