<script setup>
import { computed, inject } from "vue";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../components/title/index.vue";
import { getValidData } from "./validData";

// 通用富文本单块：供 skill、个人优势等「标题 + 富文本」模块复用，结构对齐 expItemList
const props = defineProps({
  moduleName: {
    type: String,
    required: true,
  },
  dataKey: {
    type: String,
    required: true,
  },
});

// 从上层注入获取原始简历数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 富文本内容统一存放于 data.content（与列表项 content 字段保持一致）
const contentData = computed(() =>
  getValidData(previewData.value?.[props.dataKey]?.data || {}),
);
const content = computed(() => contentData.value?.content);
</script>

<template>
  <div class="resume-row" :data-module="moduleName" :style="[lineHeightValue(), fontValue()]">
    <Title :module-key="moduleName" />
    <div v-if="contentData" class="mt-3">
      <ResumeField :model-value="content" html />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
