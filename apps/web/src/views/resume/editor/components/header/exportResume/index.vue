<script setup>
import { getExportFileName, resumeTitle } from "../../../resumeName.ts";
import eventBus from "@/utils/modules/eventBus";
import { useSystemStore, useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, onMounted, onUnmounted, ref } from "vue";
import ExportItem from "./exportItem.vue";
import { $t } from "@/locales";

const visible = ref(false);
// 所有支持清晰度的导出统一使用 2 倍，减少用户选择成本。
const exportScale = 2;
const resumeStore = useResumeStore();
const systemStore = useSystemStore();
const { currentItem, isPrinting } = storeToRefs(resumeStore);
const { isConnected } = storeToRefs(systemStore);
const pdfExportType = ref("local");
const longImageExportType = ref("png");

const pdfExportOptions = computed(() => [
  { name: $t("local"), value: "local" },
  { name: $t("cloud"), value: "server", disabled: !isConnected.value },
]);
const longImageExportOptions = [
  { name: "PNG", value: "png" },
  { name: "PDF", value: "pdf" },
];

// 服务器未连接时只禁止切换服务器选项，保留整个 PDF 导出入口。
const changePdfExportType = (value) => {
  if (value === "server" && !isConnected.value) return;
  pdfExportType.value = value;
};

// 导出当前完整简历为 JSON 文件（data/config/ui），支持无损导入恢复
const exportConfig = () => {
  const json = JSON.stringify(currentItem.value ?? {}, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  // 统一命名：轻舟简历-简历标题-年-月-日（标题取自简历数据，非配置）
  link.download = getExportFileName(resumeTitle.value, "json");
  link.click();
  URL.revokeObjectURL(url);
};

// 统一通过事件总线触发编辑器中的导出 hooks；点击导出后关闭弹窗，加载浮层全屏展示
const emitExport = (eventName) => {
  if (isPrinting.value) return;
  visible.value = false;
  eventBus.emit(eventName, exportScale);
};

// 响应导出成功弹窗的继续导出操作，重新打开导出菜单。
const openExport = () => {
  visible.value = true;
};

onMounted(() => eventBus.on("resume-open-export", openExport));
onUnmounted(() => eventBus.off("resume-open-export", openExport));

// PDF 和长图分别合并导出来源与文件类型，减少菜单入口数量。
const list = computed(() => [
  {
    name: "PDF",
    icon: "mdi:file-pdf-box",
    desc: $t("pdfDescription"),
    options: pdfExportOptions.value,
    modelValue: pdfExportType.value,
    onChange: changePdfExportType,
    fn: () =>
      emitExport(
        pdfExportType.value === "server" && isConnected.value
          ? "resume-print-server-pdf"
          : "resume-print-browser-pdf",
      ),
  },
  {
    name: $t("longImage"),
    icon: "material-symbols:image-outline",
    desc: $t("longImageDescription"),
    options: longImageExportOptions,
    modelValue: longImageExportType.value,
    onChange: (value) => (longImageExportType.value = value),
    fn: () =>
      emitExport(longImageExportType.value === "pdf" ? "resume-print-pdf" : "resume-print-image"),
  },
  {
    name: "Markdown",
    icon: "mdi:language-markdown",
    desc: $t("markdownDescription"),
    fn: () => emitExport("resume-print-markdown"),
  },
  {
    name: "HTML",
    icon: "mdi:language-html5",
    desc: $t("htmlDescription"),
    fn: () => emitExport("resume-print-html"),
  },
]);
const a = {
  name: "JSON",
  icon: "mdi:file-code-outline",
  desc: $t("jsonDescription"),
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
    <span class="hidden sm:inline"> {{ $t("exportResume") }} </span>
    <SfIcon icon="mingcute:down-line" size="4" />
  </div>

  <SfModal v-model="visible" :title="$t('exportResume')">
    <div class="flex w-[600px] max-w-[90vw] flex-col gap-6">
      <div>
        <div class="text-lg font-bold">{{ $t("exportFormat") }}</div>
        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ExportItem v-for="item in list" :key="item.name" :item="item" @click="item.fn" />
        </div>
      </div>

      <div>
        <div class="text-lg font-bold">{{ $t("resumeConfig") }}</div>
        <ExportItem :item="a" @click="a.fn" />
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
