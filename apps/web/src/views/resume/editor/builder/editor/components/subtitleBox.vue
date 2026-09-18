<script setup>
import { useFormContext } from "@/components/business/dynamicForm/api";
import { useResumeStore } from "@/stores";
import {
  getUserSubtitleKeys,
  hasUserFieldContent,
  restoreUserSubtitleFields,
  setUserSubtitleOrder,
} from "@/stores/modules/resume/hooks/useUserSubtitle";
import { storeToRefs } from "pinia";

// 副标题分区：承载置顶到姓名下方的更多字段，支持独立拖拽排序
const { currentForm } = useFormContext();
const { runtimeConfig, currentData } = storeToRefs(useResumeStore());

// 分区内出现有内容的字段才渲染，避免空内容占位
const renderable = computed(() =>
  (currentForm.value?.fields ?? []).some((field) => hasUserFieldContent(currentData.value, field.key)),
);
// 分区内字段顺序：拖拽结束后写回顺序数组，顺序数组是唯一来源
const fieldKeys = computed(() =>
  (currentForm.value?.fields ?? []).map((field) => field.key).join(","),
);

// 编辑器初始化时校正：无内容字段取消置顶，有内容字段迁入本分区
onMounted(() => {
  if (!runtimeConfig.value || !currentData.value) return;
  if (!getUserSubtitleKeys(currentData.value?.user?.ui).length) return;
  restoreUserSubtitleFields(runtimeConfig.value, currentData.value);
});

watch(fieldKeys, () => {
  setUserSubtitleOrder(
    currentData.value,
    (currentForm.value?.fields ?? []).map((field) => field.key),
  );
});
</script>

<template>
  <div
    v-if="renderable"
    class="w-full rounded-3xl border border-dashed border-sf-border bg-sf-bg-2 p-3"
  >
    <!-- 分区标题：说明字段的展示位置与排序方式 -->
    <div class="mb-3 flex items-center gap-3 text-sm text-sf-text-2">
      <span>副标题</span>
      <span>拖拽排序，展示在姓名下方</span>
    </div>
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
