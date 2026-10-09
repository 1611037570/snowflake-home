<script setup>
import { useFileDialog } from "@/hooks";
import { parseMarkdownResume } from "../markdownParser";
import { parsePdfResume } from "../pdfParser";
import { MAX_PDF_FILE_BYTES } from "../pdfDocument";
import ImportResumePreview from "./importResumePreview.vue";
import { useAiStore, useResumeStore } from "@/stores";
import { computed, onBeforeUnmount, ref, watch } from "vue";

const visible = ref(false);
const resumeStore = useResumeStore();
const aiStore = useAiStore();
const parsing = ref(false);
const parseProgress = ref("");
const pendingResume = ref(null);
let parseController = null;
let choosingDocument = false;
let importVersion = 0;
const parseModelLabel = computed(() => {
  const model = aiStore.modelList.find((item) => item.id === aiStore.getAgentModelId("resumeParser"));
  return model ? model.name || model.model : "未配置";
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
};
watch(visible, (open) => { if (!open) cancelImport(); }, { flush: "sync" });
onBeforeUnmount(cancelImport);

// PDF 与 Markdown 共用选择、解析、字段核验、预览确认和取消流程。
const importDocumentConfig = async (format) => {
  if (parsing.value || choosingDocument || pendingResume.value) return;
  const isPdf = format === "pdf";
  const click = isPdf ? clickPdf : clickMarkdown;
  const remove = isPdf ? removePdf : removeMarkdown;
  const errors = isPdf ? pdfErrors : markdownErrors;
  const model = aiStore.modelList.find((item) => item.id === aiStore.getAgentModelId("resumeParser"));
  if (!model?.key || !model.url || !model.model) {
    ElMessage.warning(isPdf ? "请先绑定支持图片识别的简历解析模型" : "请先绑定简历解析模型");
    aiStore.openModelManager("added");
    return;
  }
  let file;
  const version = importVersion;
  choosingDocument = true;
  try {
    remove();
    const files = await click();
    file = files?.[0]?.file;
    if (!file && errors.value.length) ElMessage.error(errors.value[0].msg);
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
  parseProgress.value = isPdf ? "正在读取 PDF" : "正在读取 Markdown";
  try {
    const onProgress = (message) => {
      if (parseController === controller) parseProgress.value = message;
    };
    const item = isPdf
      ? await parsePdfResume(file, controller.signal, onProgress)
      : await parseMarkdownResume(await file.text(), controller.signal, onProgress);
    if (controller.signal.aborted || parseController !== controller) return;
    pendingResume.value = item;
  } catch (error) {
    if (!controller.signal.aborted && parseController === controller) {
      ElMessage.error(error instanceof Error ? error.message : "简历解析失败，请检查文件或模型配置");
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
  if (resumeStore.addResume(resume, false)) {
    pendingResume.value = null;
    visible.value = false;
    ElMessage.success("简历导入成功");
  }
};

// 打开导入弹窗：提前判断简历数量是否已达上限
const handleOpenImport = () => {
  if (resumeStore.list.filter((item) => item.deletedAt === null).length >= resumeStore.maxCount) {
    ElMessage.warning(`简历数量已达上限（${resumeStore.maxCount}个），请先删除后再导入`);
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
      ElMessage.error(jsonErrors.value[0].msg);
    }
  } catch {
    // 用户取消选择，忽略即可
  } finally {
    removeJson();
  }
};

// 读取并解析完整简历 JSON，导入为新简历（仅创建不跳转，成功后提示）
const parseJsonConfig = async (file) => {
  if (!file) return;
  try {
    const item = JSON.parse(await file.text());
    // 完整备份必须具有简历数据和模块结构，拒绝普通 JSON 被误导入为空简历
    const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
    const validModules = (modules) => Array.isArray(modules) && modules.every((module) =>
      isObject(module) && typeof module.key === "string" && module.key.trim() &&
      (module.fields === undefined || validModules(module.fields)),
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
      throw new Error("无效的简历备份结构");
    }
    // 以解析出的完整简历创建新简历，jump=false 避免跳转编辑器
    const ok = resumeStore.addResume(item, false);
    if (ok) ElMessage.success("简历导入成功");
  } catch (error) {
    console.error("解析简历文件失败:", error);
    ElMessage.error("简历文件解析失败，请检查文件格式");
  }
};

</script>

<template>
  <SfButton @click="handleOpenImport">
    <SfIcon icon="fa6-solid:file-import" size="4" class="mr-2" />
    导入简历
  </SfButton>
  <SfModal v-model="visible" title="导入简历">
    <div v-if="parsing" class="flex w-full max-w-[400px] flex-col items-center gap-3 p-6">
      <SfIcon icon="line-md:loading-twotone-loop" size="8" class="text-sf-theme" />
      <div class="text-base">{{ parseProgress }}</div>
      <SfButton type="bg" @click="cancelImport">取消解析</SfButton>
    </div>
    <ImportResumePreview v-else-if="pendingResume" :resume="pendingResume" @confirm="confirmImport" @cancel="cancelImport" />
    <div v-else class="flex w-full max-w-[400px] flex-col gap-3">
      <p class="text-sm text-sf-text-3">解析模型：{{ parseModelLabel }}</p>
      <button type="button" class="text-left text-sm text-sf-theme" @click="aiStore.openModelManager('added')">配置解析模型</button>
      <button
        type="button"
        class="rounded-3xl border border-sf-b p-3 text-left transition-colors hover:bg-sf-theme-2"
        @click="importDocumentConfig('pdf')"
      >
        <div class="text-xl">PDF 智能解析</div>
        <div class="text-sm">支持文字与扫描简历，最多 10 页、20MB</div>
        <div class="mt-3 text-sm text-sf-text-3">文档在本地处理，页面图片直接发送到所选模型；需要支持图片识别的模型。</div>
      </button>
      <div
        class="cursor-pointer rounded-3xl border border-sf-b p-3 transition-colors hover:bg-sf-theme-2"
        @click="importJsonConfig"
      >
        <div class="text-xl">JSON完整备份</div>
        <div class="text-sm">选择并解析完整简历备份文件</div>
      </div>
      <div
        class="cursor-pointer rounded-3xl border border-sf-b p-3 transition-colors hover:bg-sf-theme-2"
        @click="importDocumentConfig('markdown')"
      >
        <div class="flex items-center gap-3">
          <SfIcon icon="ph:file-md-duotone" size="6" class="text-sf-theme" />
          <div>
            <div class="text-xl">Markdown 智能解析</div>
            <div class="text-sm">识别 Markdown 内容并转换为简历</div>
          </div>
        </div>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
