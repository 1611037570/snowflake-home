<script setup>
import { compactResumeItem } from "@/domain/resume/theme/resumeUi";
import { useResumeName } from "../../../../hooks/useResumeName";
import eventBus from "@/utils/modules/eventBus";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, onMounted, onUnmounted, ref } from "vue";
import ExportItem from "./exportItem.vue";
import { $t } from "@/locales";
import {
  getDesensitizeSelectionName,
  normalizeDesensitizeFields,
} from "@/stores/modules/resume/config/desensitizeConfig";
import DesensitizeConfigModal from "@/views/resume/editor/components/desensitizeConfigModal.vue";

const visible = ref(false);
const desensitizeVisible = ref(false);
const exportDesensitized = ref(false);
// 所有支持清晰度的导出统一使用 2 倍，减少用户选择成本。
const exportScale = 2;
const resumeStore = useResumeStore();
const { currentItem, desensitizeMode, isPrinting } = storeToRefs(resumeStore);
const { getExportFileName, resumeTitle } = useResumeName();
// PDF 保留本地与云端入口，云端沿用暂不可用状态。
const pdfExportType = ref("local");
const pdfExportOptions = computed(() => [
  {
    name: $t("local"), // 本地导出选项名称。
    value: "local", // 本地导出方式标识。
    disabled: false, // 本地方式可正常选择。
  },
  {
    name: $t("cloud"), // 云端导出选项名称。
    value: "server", // 云端导出方式标识。
    disabled: true, // 云端服务暂不可用。
  },
]);
const longImageExportType = ref("png");
const selectedFields = computed(() => normalizeDesensitizeFields(desensitizeMode.value));
const desensitizeName = computed(() => getDesensitizeSelectionName(selectedFields.value));

const longImageExportOptions = [
  { name: "PNG", value: "png" },
  { name: "PDF", value: "pdf" },
];

// 导出当前完整简历为 JSON 文件（data/config/ui），支持无损导入恢复
const exportConfig = () => {
  const json = JSON.stringify(compactResumeItem(currentItem.value) ?? {}, null, 2);
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
  eventBus.emit(eventName, {
    scale: exportScale, // 导出清晰度。
    desensitizeFields: exportDesensitized.value ? [...selectedFields.value] : [], // 本次导出采用的脱敏字段。
  });
};

// 未配置字段时先打开统一弹窗，确认后再启用脱敏导出。
const selectExportMode = (desensitized) => {
  if (desensitized && !selectedFields.value.length) {
    desensitizeVisible.value = true;
    return;
  }
  exportDesensitized.value = desensitized;
};
const handleDesensitizeConfirm = (fields) => {
  exportDesensitized.value = fields.length > 0;
};

// 响应导出成功弹窗的继续导出操作，重新打开导出菜单。
const openExport = () => {
  visible.value = true;
};

onMounted(() => eventBus.on("resume-open-export", openExport));
onUnmounted(() => eventBus.off("resume-open-export", openExport));

// 其他格式保留原有导出能力，PDF 由弹窗主按钮承载。
const list = computed(() => [
  {
    name: $t("longImage"),
    icon: "material-symbols:image-outline",
    // 文件图标的主题配色
    iconClass: "bg-sf-success-2 text-sf-success",
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
    // 文件图标的主题配色
    iconClass: "export-markdown-icon",
    desc: $t("markdownDescription"),
    fn: () => emitExport("resume-print-markdown"),
  },
  {
    name: "HTML",
    icon: "mdi:language-html5",
    // 文件图标的主题配色
    iconClass: "bg-sf-warning-2 text-sf-warning",
    desc: $t("htmlDescription"),
    fn: () => emitExport("resume-print-html"),
  },
]);
const a = {
  name: "JSON",
  icon: "mdi:file-code-outline",
  // 文件图标的主题配色
  iconClass: "bg-sf-theme-3 text-sf-theme",
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

  <SfModal
    v-model="visible"
    :title="$t('exportResume')"
    width="720px"
    title-class="justify-start! text-xl! mt-3 px-3"
  >
    <!-- 格式卡片统一排布，较小视窗使用系统滚动条。 -->
    <SfScrollbar class="export-scrollbar h-auto! flex-none!" max-height="70vh">
      <div>
        <!-- 内容选择独立成行，说明下沉，避免与操作按钮争抢空间。 -->
        <section class="flex flex-col gap-3 pb-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="shrink-0 text-sm font-medium text-sf-text">导出内容</p>
            <!-- 内容切换恢复项目统一按钮样式。 -->
            <div class="flex gap-3">
              <SfButton
                :type="exportDesensitized ? 'bg' : 'theme'"
                size="small"
                border
                :aria-pressed="!exportDesensitized"
                @click="selectExportMode(false)"
              >
                原始简历
              </SfButton>
              <SfButton
                :type="exportDesensitized ? 'theme' : 'bg'"
                size="small"
                border
                :aria-pressed="exportDesensitized"
                @click="selectExportMode(true)"
              >
                脱敏简历
              </SfButton>
            </div>
          </div>
          <div class="flex items-start justify-between gap-3">
            <!-- 仅展示当前导出内容对应的配置说明。 -->
            <p class="min-w-0 flex-1 text-xs text-sf-text-3">
              {{
                exportDesensitized
                  ? `脱敏配置：${desensitizeName}`
                  : "原始简历：保留完整内容，不应用脱敏"
              }}
            </p>
            <SfButton
              v-if="exportDesensitized"
              type="bg"
              size="small"
              border
              class="shrink-0"
              @click="desensitizeVisible = true"
            >
              修改字段
            </SfButton>
          </div>
        </section>
        <!-- 主卡片与其他格式统一图标底座，按钮沿用项目组件样式。 -->
        <section class="mb-3 rounded-xl border border-sf-b bg-sf-bg p-3">
          <div class="flex flex-wrap items-start gap-3">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sf-error-2 text-sf-error">
              <SfIcon icon="mdi:file-pdf-box" size="6" />
            </div>
            <div class="min-w-0 flex-1">
              <!-- 导出来源与格式名称同行，选中态使用中性描边和底色。 -->
              <div class="flex flex-wrap items-center gap-3">
                <p class="text-base font-semibold text-sf-text">PDF</p>
                <SfButton
                  v-for="option in pdfExportOptions"
                  :key="option.value"
                  size="small"
                  border
                  :disabled="option.disabled"
                  type="bg"
                  :class="pdfExportType === option.value ? 'border-sf-text-3! bg-sf-primary! text-sf-text!' : 'text-sf-text-3!'"
                  :aria-pressed="pdfExportType === option.value"
                  @click="pdfExportType = option.value"
                >
                  {{ option.name }}
                </SfButton>
              </div>
              <p class="text-sm leading-6 text-sf-text-3">{{ $t("pdfDescription") }}</p>
              <p v-if="exportDesensitized" class="text-xs leading-6 text-sf-text-3">脱敏后会重新排版，页数以实际导出为准。</p>
              <p class="text-xs leading-6 text-sf-text-3">{{ $t("exportCloudUnavailableTip") }}</p>
            </div>
            <SfButton
              class="h-9 shrink-0 self-center"
              :disabled="isPrinting"
              @click="emitExport(pdfExportType === 'server' ? 'resume-print-server-pdf' : 'resume-print-browser-pdf')"
            >
              导出 PDF
            </SfButton>
          </div>
        </section>
        <!-- 所有格式直接展示，保持原有卡片入口。 -->
        <div class="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ExportItem v-for="item in list" :key="item.name" :item="item" @click="item.fn" />
          <ExportItem :item="a" @click="a.fn" />
        </div>
        <div
          class="flex items-start gap-3 text-xs leading-6 text-sf-text-3"
        >
          <!-- 图标在首行文字的行高内居中，多行提示保持首行对齐。 -->
          <span class="flex h-6 shrink-0 items-center">
            <SfIcon icon="mdi:file-document-outline" size="4" />
          </span>
          <!-- 保留与当前本地导出相关的移动端排版说明。 -->
          <div class="min-w-0 space-y-3">
            <p>{{ $t("exportMobileTip") }}</p>
          </div>
        </div>
      </div>
    </SfScrollbar>
  </SfModal>
  <DesensitizeConfigModal v-model="desensitizeVisible" @confirm="handleDesensitizeConfirm" />
</template>

<style lang="scss" scoped>
/* 内容按实际高度撑开，避免固定高度与弹性布局导致底部裁切。 */
.export-scrollbar :deep(.el-scrollbar__view) {
  height: auto !important;
  display: block;
  /* 外层弹窗已提供内边距，不重复添加留白。 */
  padding: 0 !important;
}
</style>
