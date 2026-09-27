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
    ElMessage.info($t("sortByTimeNoChange"));
    return;
  }

  const result = resumeStore.applyResumeOperations(operations);
  ElMessage[result.failed.length ? "warning" : "success"](
    result.failed.length ? $t("sortByTimePartial") : $t("sortByTimeSuccess"),
  );
};
</script>

<template>
  <SfTooltip :content="$t('smartSortByTime')">
    <SfIcon
      icon="lucide:arrow-down-wide-narrow"
      @click="sortByTime"
      size="5"
      boxSize="7"
      class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
    />
  </SfTooltip>
</template>
