<script setup>
import { computed } from "vue";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../components/title/index.vue";
import { getValidData } from "./validData";
import { useResumePreviewContext } from "../previewContext";

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

// 富文本模块统一读取预览共享上下文。
const {
  data: previewData,
  theme: { fontValue, lineHeightValue, paragraphSpacingStyle },
} = useResumePreviewContext();

// 富文本内容统一存放于 data.content（与列表项 content 字段保持一致）
const contentData = computed(() =>
  getValidData(previewData.value?.[props.dataKey]?.data || {}),
);
const content = computed(() => contentData.value?.content);
</script>

<template>
  <div class="resume-row" :data-module="moduleName" :style="[lineHeightValue(), fontValue()]">
    <Title :module-key="moduleName" />
    <div v-if="contentData" :style="paragraphSpacingStyle">
      <ResumeField :model-value="content" html />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
