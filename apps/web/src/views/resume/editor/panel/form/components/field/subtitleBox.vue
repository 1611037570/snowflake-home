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
  <!-- 副标题分区恢复独立圆角边框及内部留白。 -->
  <div v-if="renderable" class="w-full rounded-3xl border border-sf-b bg-sf-primary p-3">
    <!-- 标题与说明恢复并排展示，取消浅灰标题栏与分隔线。 -->
    <div class="mb-3 flex items-center gap-3 text-sm text-sf-text-2">
      <span>{{ $t("subtitle") }}</span>
      <span>{{ $t("subtitleTip") }}</span>
    </div>
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
