<script setup>
import { computed, inject } from "vue";
import Content from "../theme/content.vue";
import Title from "../theme/title.vue";

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 代理数据解包，取 skill 字段 data 的 value
const skill = computed(() => previewData.value?.skill?.data?.value || "");
</script>

<template>
  <div class="resume-row" data-module="skill" :style="[lineHeightValue(), fontValue()]">
    <Title title="专业技能" />
    <Content :content="skill" />
  </div>
</template>

<style lang="scss" scoped></style>
