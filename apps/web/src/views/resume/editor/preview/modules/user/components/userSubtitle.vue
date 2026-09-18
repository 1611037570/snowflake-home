<script setup>
import { computed, inject } from "vue";
import ResumeField from "../../../components/resumeField/index.vue";
import { getUserSubtitleKeys } from "@/stores/modules/resume/hooks/useUserSubtitle";
import { useUserFieldVisibility } from "../useUserFieldVisibility";

// 副标题：渲染编辑器中标记的字段值，按标记序号在姓名下方并排展示
const previewData = inject("previewData");
const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
const user = computed(() => previewData.value?.user?.data || {});
// 已标记的副标题字段：按标记序号升序
const subtitleKeys = computed(() => getUserSubtitleKeys(previewData.value?.user?.ui));
const { isUserFieldHidden } = useUserFieldVisibility();
// 身高体重为对象值，按身高与体重拼接成文本展示
const heightWeightText = (value) => {
  const height = value?.height;
  const weight = value?.weight;
  const hasHeight = height != null && height !== "";
  const hasWeight = weight != null && weight !== "";
  if (!hasHeight && !hasWeight) return "";
  return [hasHeight ? `${height}cm` : "", hasWeight ? `${weight}kg` : ""].filter(Boolean).join("/");
};
// 单项内容：字段被隐藏或值空时不展示
const textOf = (key) => {
  if (!key || isUserFieldHidden(key)) return "";
  const value = user.value?.[key];
  if (value == null || value === "") return "";
  return key === "heightWeight" ? heightWeightText(value) : String(value);
};
const items = computed(() => subtitleKeys.value.map((key) => textOf(key)).filter(Boolean));
</script>

<template>
  <div
    v-if="items.length"
    :style="[fontValue(), lineHeightValue()]"
    class="mt-3 flex max-w-full min-w-0 flex-wrap items-center gap-3 font-normal"
  >
    <ResumeField v-for="(item, index) in items" :key="index" :model-value="item" />
  </div>
</template>

<style lang="scss" scoped></style>
