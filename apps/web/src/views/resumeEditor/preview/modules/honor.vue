<script setup>
import { computed, inject } from "vue";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../theme/title/index.vue";

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 获取单条荣誉证书名称（字段代理统一为 { value }）
const getName = (item) => {
  const field = item?.name;
  if (field && typeof field === "object") {
    return field.value || "";
  }
  return field || "";
};

// 模块无数据时不渲染；仅保留有名称的条目，避免空条目占位
const honors = computed(() => {
  const list = previewData.value?.honor?.data || [];
  return list.filter((item) => typeof getName(item) === "string" && getName(item).trim());
});
const hasHonor = computed(() => honors.value.length > 0);
</script>

<template>
  <div
    v-if="hasHonor"
    class="resume-row"
    data-module="honor"
    :style="[lineHeightValue(), fontValue()]"
  >
    <!-- 标题栏 -->
    <Title title="荣誉证书"></Title>
    <!-- 荣誉证书名称流式排列：容器放不下时才换行 -->
    <div class="mt-1 flex max-w-full min-w-0 flex-wrap items-center gap-2">
      <div v-for="(item, index) in honors" :key="index" class="rounded-xl bg-[#F5F7F6] px-3 py-2">
        <ResumeField v-model="item.name" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
