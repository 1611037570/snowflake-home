<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useResumeStore } from "@/stores";
import eventBus from "@/utils/modules/eventBus";
import { parsePdfResume, type ParsedPdfResume } from "./pdfReader";
import { comparePdfResume, type PdfFieldResult } from "./compareResume";

const visible = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const error = ref("");
const fileName = ref("");
const parsed = ref<ParsedPdfResume | null>(null);
const results = ref<PdfFieldResult[]>([]);
const compareCurrent = ref(true);
const comparisonItem = ref<any>(null);
const resumeStore = useResumeStore();
let runVersion = 0;

const matchedCount = computed(() => results.value.filter((item) => item.status === "matched").length);
const judgedCount = computed(() => results.value.filter((item) => item.status !== "unknown").length);
const statusText = (status: PdfFieldResult["status"]) => ({
  matched: "已识别", // 字段与当前简历一致。
  unclassified: "文字可读，字段未识别", // 字段文字存在但通用解析器未归类。
  missing: "未读到文字", // PDF 文字层缺少当前字段。
  unknown: "无法判断", // 脱敏字段不参与判断。
})[status];

// 两个入口都传入真实 PDF；源简历只在 PDF 解析完毕后用于对照。
const check = async (file: Blob, name: string, item: any) => {
  const version = ++runVersion;
  visible.value = true;
  loading.value = true;
  error.value = "";
  fileName.value = name;
  parsed.value = null;
  results.value = [];
  comparisonItem.value = item ? JSON.parse(JSON.stringify(item)) : null;
  try {
    const pdf = await parsePdfResume(file);
    if (version !== runVersion) return;
    parsed.value = pdf;
    results.value = compareCurrent.value && comparisonItem.value ? comparePdfResume(pdf, comparisonItem.value) : [];
  } catch (cause) {
    if (version === runVersion) error.value = cause instanceof Error ? cause.message : "PDF 解析失败";
  } finally {
    if (version === runVersion) loading.value = false;
  }
};

const chooseFile = () => fileInput.value?.click();
const open = () => { visible.value = true; };
const handleFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  void check(file, file.name, resumeStore.currentItem);
};
const handleCloudPdf = (payload: unknown) => {
  const file = payload as {
    blob: Blob; // 云端生成的最终 PDF 文件。
    fileName: string; // 下载文件名。
    item: unknown; // 导出时的简历快照，仅供事后对照。
  };
  compareCurrent.value = true;
  void check(file.blob, file.fileName, file.item);
};

watch(compareCurrent, () => {
  results.value = compareCurrent.value && parsed.value && comparisonItem.value
    ? comparePdfResume(parsed.value, comparisonItem.value)
    : [];
});

onMounted(() => eventBus.on("resume-pdf-check", handleCloudPdf));
onUnmounted(() => {
  runVersion += 1;
  eventBus.off("resume-pdf-check", handleCloudPdf);
});
defineExpose({ open });
</script>

<template>
  <input ref="fileInput" class="hidden" type="file" accept="application/pdf,.pdf" @change="handleFile" />
  <SfModal v-model="visible" title="PDF 机器解析自检" width="720px">
    <div class="flex flex-col gap-3 text-sm text-sf-text">
      <p class="text-sf-text-2">仅在浏览器读取 PDF 文件；解析器不读取简历数据，对照在解析结束后进行。结果不代表所有招聘系统的解析结果。</p>
      <p class="text-sf-text-2">首版对照姓名、电话、邮箱、工作及实习单位、学校；其他字段暂不评分。</p>
      <div class="flex flex-wrap items-center gap-3">
        <SfButton type="bg" @click="chooseFile">选择 PDF 文件</SfButton>
        <span class="min-w-0 truncate text-sf-text-2">{{ fileName }}</span>
      </div>
      <label class="flex items-center gap-3"><input v-model="compareCurrent" type="checkbox" />与当前简历对照；检测其他来源的 PDF 时也可只看独立识别结果</label>
      <p v-if="loading">正在从 PDF 提取文字并识别字段…</p>
      <p v-else-if="error" class="text-sf-error">{{ error }}</p>
      <template v-else-if="parsed">
        <div class="rounded-xl border border-sf-b bg-sf-bg p-3">
          <p>共 {{ parsed.pages }} 页，读取到 {{ parsed.text.length }} 个文字字符。</p>
          <p v-if="!parsed.text.trim()" class="text-sf-error">未读取到文字层；图片型 PDF 无法进行本次字段识别。</p>
          <p v-else>独立识别：姓名 {{ parsed.name || "未识别" }}；邮箱 {{ parsed.emails.join("、") || "未识别" }}；电话 {{ parsed.phones.join("、") || "未识别" }}。</p>
        </div>
        <!-- 经历和教育仅展示 PDF 独立识别的片段，便于检查分类结果。 -->
        <details v-if="parsed.work || parsed.education" class="rounded-xl border border-sf-b p-3">
          <summary class="cursor-pointer">查看独立识别的经历与教育</summary>
          <p v-if="parsed.work" class="mt-3 font-medium">工作经历</p>
          <pre v-if="parsed.work" class="max-h-60 overflow-auto whitespace-pre-wrap break-words text-xs">{{ parsed.work }}</pre>
          <p v-if="parsed.education" class="mt-3 font-medium">教育经历</p>
          <pre v-if="parsed.education" class="max-h-60 overflow-auto whitespace-pre-wrap break-words text-xs">{{ parsed.education }}</pre>
        </details>
        <div v-if="results.length" class="flex flex-col gap-3">
          <p class="font-medium">与当前简历对照：{{ matchedCount }} / {{ judgedCount }} 项已识别</p>
          <div v-for="(field, index) in results" :key="`${field.label}-${index}`" class="flex flex-wrap items-start justify-between gap-3 border-b border-sf-b pb-3">
            <div class="min-w-0 flex-1">
              <p class="font-medium">{{ field.label }}：{{ field.expected }}</p>
              <p v-if="field.status !== 'matched' && field.actual" class="line-clamp-2 text-sf-text-2">PDF 识别片段：{{ field.actual }}</p>
            </div>
            <span :class="field.status === 'matched' ? 'text-sf-success' : field.status === 'missing' ? 'text-sf-error' : 'text-sf-text-2'">{{ statusText(field.status) }}</span>
          </div>
        </div>
        <p v-else-if="compareCurrent && !comparisonItem" class="text-sf-text-2">当前没有可对照的简历，仅显示独立识别结果。</p>
        <details class="rounded-xl border border-sf-b p-3">
          <summary class="cursor-pointer">查看 PDF 提取原文</summary>
          <pre class="mt-3 max-h-60 overflow-auto whitespace-pre-wrap break-words text-xs">{{ parsed.text || "无可提取文字" }}</pre>
        </details>
      </template>
    </div>
  </SfModal>
</template>
