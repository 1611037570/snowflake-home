<script setup>
import { ElMessage } from "element-plus";
import { useResumeStore } from "@/stores";
import { $t } from "@/locales";
import { storeToRefs } from "pinia";

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);
const timeModules = ["education", "work", "project"];

const parseTime = (value) => {
  const text = String(value || "").trim();
  if (!text) return null;
  if (/^(至今|现在|present|current)$/i.test(text)) return Number.POSITIVE_INFINITY;
  const match = text.match(/^(\d{4})\s*(?:[./年-]\s*(\d{1,2}))?/);
  return match ? Number(match[1]) * 12 + Number(match[2] || 0) : null;
};

// 教育、工作、项目及自定义模块经历按结束时间从近到远排序。
const sortByTime = () => {
  const operations = [];
  const modules = [
    ...timeModules,
    ...Object.keys(currentData.value || {}).filter((key) => key.startsWith("custom_")),
  ];

  modules.forEach((module) => {
    const records = currentData.value?.[module]?.list;
    if (!Array.isArray(records) || records.length < 2) return;

    const sortedRecords = records
      .map((record, index) => {
        const startTime = parseTime(record?.data?.startTime);
        return {
          record,
          index,
          time: parseTime(record?.data?.endTime) ?? startTime ?? Number.NEGATIVE_INFINITY,
          startTime: startTime ?? Number.NEGATIVE_INFINITY,
        };
      })
      .sort(
        (left, right) =>
          right.time - left.time || right.startTime - left.startTime || left.index - right.index,
      );
    const workingRecords = [...records];

    sortedRecords.forEach(({ record }, to) => {
      const from = workingRecords.indexOf(record);
      if (from === to) return;
      operations.push({ op: "moveRecord", module, from, to });
      const [movedRecord] = workingRecords.splice(from, 1);
      workingRecords.splice(to, 0, movedRecord);
    });
  });

  if (!operations.length) {
    // 提示统一从右上角显示，避开顶部头部工具栏。
    ElMessage.info({ message: $t("sortByTimeNoChange"), position: "top-right", offset: 40 });
    return;
  }

  const result = resumeStore.applyResumeOperations(operations);
  ElMessage[result.failed.length ? "warning" : "success"]({
    message: result.failed.length ? $t("sortByTimePartial") : $t("sortByTimeSuccess"),
    position: "top-right",
    offset: 40,
  });
};
</script>

<template>
  <!-- 智能排序入口移至模块侧栏，外观与折叠及添加入口保持一致；不再附带文字提示。 -->
  <button
    type="button"
    @click="sortByTime"
    :disabled="!currentData"
    class="rail-action flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-3xl p-1 text-[12px] text-sf-text-2 transition-colors select-none hover:bg-sf-bg"
  >
    <SfIcon icon="lucide:arrow-down-wide-narrow" size="4" />
    <span class="max-md:hidden">{{ $t("smartSort") }}</span>
  </button>
</template>
