<script setup>
import { computed, inject } from "vue";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../components/title/index.vue";

import { getTime } from "../../utils";
import { getValidData } from "./validData";

// 从上层注入获取原始简历数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 数组记录统一由 getValidData 过滤并提取业务内容
const education = computed(() => {
  const list = previewData.value?.education?.data || [];
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
        class="mt-3 flex flex-wrap items-center justify-between"
        v-if="item.name || getTime(item.time)"
      >
        <div class="flex max-w-full min-w-0 flex-wrap items-baseline gap-4">
          <div class="font-bold" :style="[fontValue(3)]">
            <ResumeField :model-value="item.name" />
          </div>
        </div>
        <div class="flex max-w-full min-w-0 flex-wrap items-center gap-2">
          <span>{{ getTime(item.time) }}</span>
        </div>
      </div>
      <!-- 次信息行：post / education / mode，不创建临时对象，直接基于原字段渲染 -->
      <div
        class="mt-3 flex max-w-full min-w-0 flex-wrap items-center gap-2"
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
      <ResumeField :model-value="item.content" html />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
