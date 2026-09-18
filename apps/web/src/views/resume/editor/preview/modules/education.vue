<script setup>
import { computed, inject } from "vue";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../components/title/index.vue";
import { isContentEmpty } from "../modules/validData";
import { getTime } from "../../utils";
import { getValidData } from "./validData";
import ItemTitle from "../components/itemTitle.vue";

// 从上层注入获取原始简历数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
const paragraphSpacingStyle = inject("paragraphSpacingStyle");
// 日期样式（2026.9 / 2026年9月），由设计配置注入
const dateStyle = inject("dateStyle");

// 数组记录统一由 getValidData 过滤并提取业务内容
const education = computed(() => {
  const list = previewData.value?.education?.list || [];
  return getValidData(list);
});

// 判断是否有某项字段（用于渲染 infoList 的分隔点）
const hasField = (item, key) => {
  const v = item?.[key];
  return v && typeof v === "string" && v.trim();
};

// 条目是否含首行信息（名称/学历/学制/时间），为空时不渲染首行，避免多出空行间距
const hasItemHeader = (item) =>
  Boolean(
    item.name ||
      hasField(item, "education") ||
      hasField(item, "mode") ||
      getTime(item.startTime, item.endTime, dateStyle),
  );

// 次信息行是否可渲染
const hasSubInfo = (item) =>
  Boolean(hasField(item, "college") || hasField(item, "post") || hasField(item, "city"));

// 次信息行成为条目首块时，由它承担段间距
const subInfoIsFirst = (item) => !hasItemHeader(item);

// 内容行成为条目首块（首行与次信息行都不渲染）时，由它承担段间距
const contentIsFirst = (item) => !hasItemHeader(item) && !hasSubInfo(item);
</script>

<template>
  <div class="resume-row w-full" data-module="education" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title module-key="education"></Title>
    <!-- 内容区：直接渲染已过滤的业务数据 -->
    <template v-for="(item, index) in education" :key="index">
      <div
        v-if="hasItemHeader(item)"
        :style="paragraphSpacingStyle"
        class="flex flex-wrap items-center justify-between"
      >
        <!-- 信息容器撑满行内剩余宽度，避免导出渲染时子项宽度取整触发换行错位 -->
        <div class="flex max-w-full min-w-0 flex-1 flex-wrap items-baseline gap-3">
          <ItemTitle :name="item.name" />
          <ResumeField v-if="hasField(item, 'education')" :model-value="item.education" />
          <ResumeField v-if="hasField(item, 'mode')" :model-value="item.mode" />
        </div>
        <div class="flex max-w-full min-w-0 flex-wrap items-center gap-2">
          <span>{{ getTime(item.startTime, item.endTime, dateStyle) }}</span>
        </div>
      </div>
      <!-- 次信息行：左侧专业与学院名称，右侧所在城市，直接基于原字段渲染 -->
      <!-- 首行未渲染时由本行承担段间距（内联段距覆盖固定 mt-3） -->
      <div
        class="mt-3 flex flex-wrap items-center justify-between"
        :style="subInfoIsFirst(item) ? paragraphSpacingStyle : undefined"
        v-if="hasSubInfo(item)"
      >
        <div class="flex max-w-full min-w-0 flex-1 flex-wrap items-center gap-3">
          <ResumeField v-if="hasField(item, 'post')" :model-value="item.post" />
          <ResumeField v-if="hasField(item, 'college')" :model-value="item.college" />
        </div>
        <div class="flex max-w-full min-w-0 flex-wrap items-center">
          <ResumeField v-if="hasField(item, 'city')" :model-value="item.city" />
        </div>
      </div>
      <!-- 补充描述/经历：成为条目首块时由段间距承担上间距 -->
      <ResumeField
        :model-value="item.content"
        html
        class="mt-3"
        :style="contentIsFirst(item) ? paragraphSpacingStyle : undefined"
        v-if="!isContentEmpty(item.content)"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
