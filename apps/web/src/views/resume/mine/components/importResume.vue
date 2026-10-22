<script setup>
import { useFileDialog, trackResumeAction } from "@/hooks";
import confirm from "@/components/business/confirm";
import { parseMarkdownResume } from "../markdownParser";
import { parsePdfResume } from "../pdfParser";
import { MAX_PDF_FILE_BYTES } from "../pdfDocument";
import ImportResumePreview from "./importResumePreview.vue";
import { useResumeAiAvailability } from "@/views/resume/hooks/useResumeAiAvailability";
import { hasResumeAiModel } from "@snowflake/resume-agent";
import { useAiStore, useResumeStore } from "@/stores";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import i18n, { $t } from "@/locales";

const props = defineProps({
  jumpAfterImport: { type: Boolean, default: false }, // 在编辑器导入成功后打开新简历
});
const visible = ref(false);
const resumeStore = useResumeStore();
const aiStore = useAiStore();
const router = useRouter();
const parsing = ref(false);
const parseProgress = ref("");
const pendingResume = ref(null);
// 待导入文件的来源格式，用于导入成功后上报动作
const pendingDocFormat = ref("");
let parseController = null;
let choosingDocument = false;
let importVersion = 0;
const { ensureAiAvailable } = useResumeAiAvailability();

// 解析模型按格式区分：PDF 用简历解析角色（需图片识别），Markdown 用小舟。
const agentModelLabel = (agent) => {
  const model = aiStore.modelList.find((item) => item.id === aiStore.getAgentModelId(agent));
  return model ? model.name || model.model : $t("resumeImportModelUnconfigured");
};
const pdfModelLabel = computed(() => {
  i18n.global.locale.value;
  return agentModelLabel("resumeParser");
});
const markdownModelLabel = computed(() => {
  i18n.global.locale.value;
  return agentModelLabel("xiaoZhou");
});

const { click: clickJson, remove: removeJson, errorList: jsonErrors } = useFileDialog({
  accept: ".json,application/json",
  multiple: false,
  maxCount: 1,
});
const { click: clickMarkdown, remove: removeMarkdown, errorList: markdownErrors } = useFileDialog({
  accept: ".md,.markdown,text/markdown",
  multiple: false,
  maxCount: 1,
});
const { click: clickPdf, remove: removePdf, errorList: pdfErrors } = useFileDialog({
  // 仅选择单份 PDF，大小和页数在解析器中校验
  accept: ".pdf,application/pdf",
  // 与解析器的二十兆限制保持一致
  maxSize: MAX_PDF_FILE_BYTES,
  multiple: false,
  maxCount: 1,
});

// 关闭、取消或卸载都使旧解析任务失效，不接收迟到的模型结果。
const cancelImport = () => {
  // 同时使尚未返回的文件选择失效。
  importVersion++;
  parseController?.abort();
  parseController = null;
  parsing.value = false;
  pendingResume.value = null;
  pendingDocFormat.value = "";
};
watch(visible, (open) => { if (!open) cancelImport(); }, { flush: "sync" });
onBeforeUnmount(cancelImport);

// 列表页没有编辑器模型弹窗，直接前往已有的模型配置页面。
const configureParseModel = () => {
  visible.value = false;
  aiStore.modelManagerTab = "added";
  router.push("/resume/ai");
};

// PDF 与 Markdown 共用选择、解析、字段核验、预览确认和取消流程。
const importDocumentConfig = async (format) => {
  if (parsing.value || choosingDocument || pendingResume.value) return;
  const isPdf = format === "pdf";
  const click = isPdf ? clickPdf : clickMarkdown;
  const remove = isPdf ? removePdf : removeMarkdown;
  const errors = isPdf ? pdfErrors : markdownErrors;
  // Markdown 由小舟解析，走统一的 AI 可用性检查；确认框与跳转沿用列表页入口。
  if (!isPdf) {
    if (!ensureAiAvailable(configureParseModel)) return;
  } else {
    // PDF 使用简历解析角色，按统一使用方的角色检查判断是否已绑定
    if (!hasResumeAiModel("resumeParser")) {
      // 缺少模型时保留导入弹窗，由确认框提示，用户选择后再决定是否前往配置页。
      try {
        await confirm($t("resumeImportPdfModelRequired"), $t("resumeImportPdfModelMissingTitle"), {
          confirmText: $t("resumeImportGoConfigure"),
          cancelText: $t("resumeImportCancel"),
        });
      } catch {
        // 用户取消配置：留在导入弹窗，不做跳转。
        return;
      }
      configureParseModel();
      return;
    }
  }
  let file;
  const version = importVersion;
  choosingDocument = true;
  try {
    remove();
    const files = await click();
    file = files?.[0]?.file;
    if (!file && errors.value.length)
      ElMessage.error({ message: errors.value[0].msg, position: "top-right", offset: 40 });
  } catch {
    return;
  } finally {
    choosingDocument = false;
    remove();
  }
  if (!file || !visible.value || version !== importVersion) return;
  const controller = new AbortController();
  parseController = controller;
  parsing.value = true;
  parseProgress.value = isPdf ? $t("resumeImportReadingPdf") : $t("resumeImportReadingMarkdown");
  try {
    const onProgress = (message) => {
      if (parseController === controller) parseProgress.value = message;
    };
    const item = isPdf
      ? await parsePdfResume(file, controller.signal, onProgress)
      : await parseMarkdownResume(await file.text(), controller.signal, onProgress);
    if (controller.signal.aborted || parseController !== controller) return;
    pendingResume.value = item;
    // 记录来源格式，PDF 与 Markdown 解析共用同一确认入口
    pendingDocFormat.value = format;
  } catch (error) {
    if (!controller.signal.aborted && parseController === controller) {
      ElMessage.error({
        message: error instanceof Error ? error.message : $t("resumeImportParseFailed"),
        position: "top-right",
        offset: 40,
      });
    }
  } finally {
    if (parseController === controller) {
      parseController = null;
      parsing.value = false;
    }
  }
};

// 转换后的结果仅在确认时创建，提示信息不进入简历存储。
const confirmImport = () => {
  const item = pendingResume.value;
  if (!item) return;
  const { warnings, ...resume } = item;
  if (resumeStore.addResume(resume, props.jumpAfterImport)) {
    // 导入成功后按来源格式上报一次导入动作
    trackResumeAction({
      eventType: "import",
      fileType: pendingDocFormat.value === "pdf" ? "pdf" : "markdown",
    });
    pendingResume.value = null;
    visible.value = false;
    ElMessage.success({ message: $t("resumeImportSuccess"), position: "top-right", offset: 40 });
  }
};

// 打开导入弹窗：提前判断简历数量是否已达上限
const handleOpenImport = () => {
  if (resumeStore.list.filter((item) => item.deletedAt === null).length >= resumeStore.maxCount) {
    ElMessage.warning({
      message: $t("resumeImportMaxLimit", { max: resumeStore.maxCount }),
      position: "top-right",
      offset: 40,
    });
    return;
  }
  visible.value = true;
};
// 选择 JSON 配置文件
const importJsonConfig = async () => {
  visible.value = false;
  try {
    // 每次重新选择，不能沿用上一次的文件计数与事件监听
    removeJson();
    // click 返回合法文件列表，用户取消选择时会 reject
    const successList = await clickJson();
    const file = successList?.[0]?.file;
    if (file) {
      await parseJsonConfig(file);
    } else if (jsonErrors.value.length) {
      ElMessage.error({ message: jsonErrors.value[0].msg, position: "top-right", offset: 40 });
    }
  } catch {
    // 用户取消选择，忽略即可
  } finally {
    removeJson();
  }
};

// 读取并解析完整简历 JSON，导入为新简历并按入口决定是否跳转。
const parseJsonConfig = async (file) => {
  if (!file) return;
  try {
    const item = JSON.parse(await file.text());
    // 完整备份必须具有简历数据和模块结构，拒绝普通 JSON 被误导入为空简历
    const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
    // 当前备份可能包含无编号容器压缩出的空字段；仅字段列表允许空占位，模块仍须有编号。
    const validModules = (modules, isFieldList = false) => Array.isArray(modules) && modules.every((module) =>
      isObject(module) && ((isFieldList && Object.keys(module).length === 0) ||
        (typeof module.key === "string" && module.key.trim() &&
          (module.fields === undefined || validModules(module.fields, true)))),
    );
    if (!isObject(item) || !isObject(item.data) || !isObject(item.config) ||
      !validModules(item.config.modules) ||
      !Object.values(item.data).every((module) => isObject(module) &&
        (module.data === undefined || isObject(module.data)) &&
        (module.list === undefined || (Array.isArray(module.list) && module.list.every((record) =>
          isObject(record) && (record.data === undefined || isObject(record.data)),
        )))) ||
      (item.ui !== undefined && !isObject(item.ui)) ||
      (item.usage !== undefined && !isObject(item.usage))) {
      throw new Error($t("resumeImportInvalidBackup"));
    }
    // 以解析出的完整简历创建新简历，编辑器入口导入后跳到新简历。
    // 编辑器入口导入后进入新简历，列表页入口继续停留在列表。
    const ok = resumeStore.addResume(item, props.jumpAfterImport);
    if (ok) {
      // 导入成功后上报一次 JSON 导入动作
      trackResumeAction({ eventType: "import", fileType: "json" });
      ElMessage.success({ message: $t("resumeImportSuccess"), position: "top-right", offset: 40 });
    }
  } catch (error) {
    console.error("解析简历文件失败:", error);
    ElMessage.error({ message: $t("resumeImportJsonParseFailed"), position: "top-right", offset: 40 });
  }
};

// 导入入口沿用导出弹窗的格式配色与卡片层次。
const importItems = computed(() => {
  i18n.global.locale.value;
  return [
    {
      // 格式标题
      name: $t("resumeImportPdfParse"),
      // 文件图标
      icon: "mdi:file-pdf-box",
      // 图标背景与文字配色
      iconClass: "bg-sf-error-2 text-sf-error",
      // 格式说明
      desc: $t("resumeImportPdfParseDesc"),
      // 文件选择入口
      fn: () => importDocumentConfig("pdf"),
    },
    {
      // 格式标题
      name: $t("resumeImportMarkdownParse"),
      // 文件图标
      icon: "mdi:language-markdown",
      // 图标背景与文字配色
      iconClass: "import-markdown-icon",
      // 格式说明
      desc: $t("resumeImportMarkdownParseDesc"),
      // 文件选择入口
      fn: () => importDocumentConfig("markdown"),
    },
    {
      // 格式标题
      name: $t("resumeImportJsonBackup"),
      // 文件图标
      icon: "mdi:file-code-outline",
      // 图标背景与文字配色
      iconClass: "bg-sf-theme-3 text-sf-theme",
      // 格式说明
      desc: $t("resumeImportJsonBackupDesc"),
      // 文件选择入口
      fn: importJsonConfig,
    },
  ];
});
</script>

<template>
  <!-- 编辑器侧栏可复用导入流程，并提供符合侧栏尺寸的入口。 -->
  <slot name="trigger" :open="handleOpenImport">
    <SfButton @click="handleOpenImport">
      <SfIcon icon="fa6-solid:file-import" size="4" class="mr-2" />
      {{ $t("resumeImportResume") }}
    </SfButton>
  </slot>
  <SfModal v-model="visible" :title="$t('resumeImportResume')" :width="parsing || pendingResume ? '600px' : '720px'" title-class="justify-start! text-xl!">
    <div v-if="parsing" class="flex w-full flex-col items-center gap-3 p-3">
      <SfIcon icon="line-md:loading-twotone-loop" size="8" class="text-sf-theme" />
      <div class="text-base">{{ parseProgress }}</div>
      <SfButton type="bg" @click="cancelImport">{{ $t("resumeImportCancelParsing") }}</SfButton>
    </div>
    <ImportResumePreview v-else-if="pendingResume" :resume="pendingResume" @confirm="confirmImport" @cancel="cancelImport" />
    <!-- 菜单使用自然内容高度，避免窄屏滚动时底部被裁切。 -->
    <SfScrollbar v-else class="import-scrollbar h-auto! flex-none!" max-height="70vh">
      <div>
        <p class="border-b border-sf-b pb-3 text-sm text-sf-text-3">{{ $t("resumeImportDescription") }}</p>
        <div class="grid grid-cols-1 gap-3 py-3 sm:grid-cols-2">
          <button
            v-for="item in importItems"
            :key="item.name"
            type="button"
            class="group flex min-w-0 items-center gap-3 rounded-3xl border border-sf-b bg-sf-bg p-3 text-left transition-colors duration-200 hover:border-sf-theme"
            :class="{ 'sm:col-span-2': item.icon === 'mdi:file-code-outline' }"
            @click="item.fn"
          >
            <span class="flex h-15 w-12 shrink-0 -rotate-6 items-center justify-center rounded-2xl border border-sf-b shadow-sm transition-transform duration-200 group-hover:rotate-0" :class="item.iconClass">
              <SfIcon :icon="item.icon" size="8" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-base font-semibold text-sf-text">{{ item.name }}</span>
              <span class="mt-3 block text-[13px] leading-6 text-sf-text-3">{{ item.desc }}</span>
            </span>
            <SfIcon icon="mingcute:right-line" size="4" class="shrink-0 text-sf-text-3 transition-transform group-hover:translate-x-1 group-hover:text-sf-theme" />
          </button>
        </div>
        <div class="flex flex-col gap-3 rounded-2xl border border-sf-b bg-sf-bg p-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="min-w-0 text-sm text-sf-text-2">
              <p class="break-words">{{ $t("resumeImportPdfModel") }}{{ pdfModelLabel }}</p>
              <p class="break-words">{{ $t("resumeImportMarkdownModel") }}{{ markdownModelLabel }}</p>
            </div>
            <SfButton type="bg" size="small" border @click="configureParseModel">{{ $t("resumeImportConfigureModel") }}</SfButton>
          </div>
          <p class="text-sm leading-6 text-sf-text-3">{{ $t("resumeImportPdfModelTip") }}</p>
        </div>
      </div>
    </SfScrollbar>
  </SfModal>
</template>

<style lang="scss" scoped>
/* 弹窗已提供内边距，滚动内容按实际高度排列。 */
.import-scrollbar :deep(.el-scrollbar__view) {
  height: auto !important;
  display: block;
  padding: 0 !important;
}

/* 与导出菜单保持一致的柔和紫色文件图标。 */
.import-markdown-icon {
  --import-markdown-color: color-mix(in oklch, var(--sf-theme), var(--sf-error));
  color: var(--import-markdown-color);
  background-color: color-mix(in oklab, var(--import-markdown-color) 15%, transparent);
}
</style>
