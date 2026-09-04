<script setup>
import { computed, inject } from "vue";
import DiffField from "../components/diffField/index.vue";
import Title from "../theme/title/index.vue";

// 通用富文本单块：供 skill、个人优势等「标题 + 富文本」模块复用，结构对齐 expItemList
const props = defineProps({
  moduleName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  dataKey: {
    type: String,
    required: true,
  },
});

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 富文本内容统一存放于 data.content（与列表项 content 字段保持一致）
const content = computed(() => previewData.value?.[props.dataKey]?.data?.content);
</script>

<template>
  <div class="resume-row" :data-module="moduleName" :style="[lineHeightValue(), fontValue()]">
    <Title :title="title" />
    <DiffField :model-value="content" html />
  </div>
</template>

<style lang="scss" scoped></style>
