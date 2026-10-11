<script setup>
import { useFormContext } from "@/components/business/dynamicForm/api";
import { useResumeStore } from "@/stores";
import {
  hasUserFieldContent,
  setUserSubtitleOrder,
} from "@/stores/modules/resume/hooks/useUserSubtitle";
import { storeToRefs } from "pinia";

// 副标题分区：承载置顶到姓名下方的更多字段，支持独立拖拽排序
const { currentForm } = useFormContext();
const { currentData } = storeToRefs(useResumeStore());

// 分区内出现有内容的字段才渲染，避免空内容占位
const renderable = computed(() =>
  (currentForm.value?.fields ?? []).some((field) =>
    hasUserFieldContent(currentData.value, field.key),
  ),
);
// 分区内字段顺序：拖拽结束后写回顺序数组，顺序数组是唯一来源
const fieldKeys = computed(() =>
  (currentForm.value?.fields ?? []).map((field) => field.key).join(","),
);

watch(fieldKeys, () => {
  setUserSubtitleOrder(
    currentData.value,
    (currentForm.value?.fields ?? []).map((field) => field.key),
  );
});
</script>

<template>
  <!-- 标题与所属字段共用浅灰底色，明确副标题分区范围。 -->
  <div v-if="renderable" class="w-full bg-sf-bg">
    <!-- 标题与说明分列，沿用中性色与细分隔线。 -->
    <header
      class="flex flex-wrap items-center justify-between gap-3 border-b border-sf-b px-3 py-3"
    >
      <span class="text-sm font-medium text-sf-text">{{ $t("subtitle") }}</span>
      <span class="text-xs text-sf-text-3">{{ $t("subtitleTip") }}</span>
    </header>
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
