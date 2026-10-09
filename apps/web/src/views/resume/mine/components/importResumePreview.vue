<script setup lang="ts">
import { computed } from "vue";
import { RESUME_SCHEMA } from "../../editor/assistant/resumeSchemaRegistry";
import type { normalizeResumeData } from "../resumeImportNormalizer";

const props = defineProps<{
  // 已清洗并通过字段校验的待导入简历
  resume: ReturnType<typeof normalizeResumeData>;
}>();
const emit = defineEmits<{
  // 用户确认创建新简历
  confirm: [];
  // 用户放弃当前解析结果
  cancel: [];
}>();

// 仅展示业务字段，富文本转为纯文本，避免预览执行文档内容。
const displayValue = (value: unknown, html: boolean): string => {
  if (typeof value !== "string") return JSON.stringify(value) ?? "";
  if (!html) return value;
  const document = new DOMParser().parseFromString(value, "text/html");
  document.querySelectorAll("p,li,br").forEach((element) => element.append("\n"));
  return document.body.textContent?.trim() ?? "";
};
const modules = computed(() => props.resume.config.modules.map(({ key }) => {
  const schema = RESUME_SCHEMA.find((module) => module.key === key);
  const module = props.resume.data[key];
  const records = module.list ? module.list.map((record: any) => record.data) : [module.data];
  return {
    // 模块稳定标识
    key,
    // 表单契约中的展示标题
    title: schema?.title ?? key,
    // 按记录展示已提取字段
    records: records.map((record: Record<string, unknown>) => Object.entries(record).map(([field, value]) => ({
      // 字段稳定标识
      key: field,
      // 表单中的中文字段名称
      label: schema?.fields.find((item) => item.key === field)?.label ?? field,
      // 已转换为纯文本的字段内容
      value: displayValue(value, schema?.fields.find((item) => item.key === field)?.format === "html"),
    }))),
  };
}));
</script>

<template>
  <div class="flex w-full max-w-[600px] flex-col gap-3">
    <p class="text-sm text-sf-text-3">请核对识别结果，确认后创建新简历。</p>
    <p v-if="!resume.data.user?.data?.name" class="text-sm text-sf-text-3">未识别到姓名，导入后可在编辑器中补充。</p>
    <div class="max-h-[60vh] overflow-y-auto space-y-3">
      <section v-for="module in modules" :key="module.key" class="rounded-3xl border border-sf-b p-3">
        <h3 class="mb-3 font-bold">{{ module.title }}</h3>
        <dl v-for="(record, index) in module.records" :key="index" class="mb-3 space-y-3">
          <div v-for="field in record" :key="field.key">
            <dt class="text-sm text-sf-text-3">{{ field.label }}</dt>
            <dd class="whitespace-pre-wrap break-words text-sm">{{ field.value }}</dd>
          </div>
        </dl>
      </section>
    </div>
    <div class="flex justify-end gap-3">
      <SfButton type="bg" @click="emit('cancel')">放弃导入</SfButton>
      <SfButton @click="emit('confirm')">确认导入</SfButton>
    </div>
  </div>
</template>
