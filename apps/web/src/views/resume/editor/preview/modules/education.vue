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
</script>

<template>
  <div class="resume-row w-full" data-module="education" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title module-key="education"></Title>
    <!-- 内容区：直接渲染已过滤的业务数据 -->
    <template v-for="(item, index) in education" :key="index">
      <div
        :style="paragraphSpacingStyle"
        class="flex flex-wrap items-center justify-between"
        v-if="item.name || getTime(item.startTime, item.endTime, dateStyle)"
      >
        <div class="flex max-w-full min-w-0 flex-wrap items-baseline gap-3">
          <ItemTitle :name="item.name" />
        </div>
        <div class="flex max-w-full min-w-0 flex-wrap items-center gap-2">
          <span>{{ getTime(item.startTime, item.endTime, dateStyle) }}</span>
        </div>
      </div>
      <!-- 次信息行：post / education / mode，不创建临时对象，直接基于原字段渲染 -->
      <div
        class="mt-3 flex max-w-full min-w-0 flex-wrap items-center gap-3"
        v-if="hasField(item, 'post') || hasField(item, 'education') || hasField(item, 'mode')"
      >
        <template v-if="hasField(item, 'education')">
          <ResumeField :model-value="item.education" />
        </template>
        <template v-if="hasField(item, 'post')">
          <div v-if="hasField(item, 'education')" class="h-1 w-1 rounded-full bg-black"></div>
          <ResumeField :model-value="item.post" />
        </template>
        <template v-if="hasField(item, 'mode')">
          <div
            v-if="hasField(item, 'education') || hasField(item, 'post')"
            class="h-1 w-1 rounded-full bg-black"
          ></div>
          <ResumeField :model-value="item.mode" />
        </template>
      </div>
      <!-- 补充描述/经历 -->
      <ResumeField
        :model-value="item.content"
        html
        class="mt-3"
        v-if="!isContentEmpty(item.content)"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
