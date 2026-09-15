<script setup>
import { computed, inject } from "vue";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../components/title/index.vue";
import { getValidData } from "./validData";

// 从上层注入获取原始简历数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
const paragraphSpacingStyle = inject("paragraphSpacingStyle");

const honors = computed(() => {
  const list = previewData.value?.honor?.data || [];
  return getValidData(list);
});
</script>

<template>
  <div
    class="resume-row"
    data-module="honor"
    :style="[lineHeightValue(), fontValue()]"
  >
    <!-- 标题栏 -->
    <Title module-key="honor"></Title>
    <!-- 荣誉证书名称流式排列：容器放不下时才换行 -->
    <div
      v-if="honors.length"
      :style="paragraphSpacingStyle"
      class="flex max-w-full min-w-0 flex-wrap items-center gap-2"
    >
      <div v-for="(item, index) in honors" :key="index" class="rounded-xl bg-[#F5F7F6] px-3 py-2">
        <ResumeField :model-value="item.name" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
