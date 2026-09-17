<script setup>
import { computed, inject } from "vue";
import ResumeField from "../../../components/resumeField/index.vue";
import { useUserFieldVisibility } from "../useUserFieldVisibility";

// 副标题：渲染编辑器中标记的字段值，位置在姓名下方
const previewData = inject("previewData");
const user = computed(() => previewData.value?.user?.data || {});
// 已标记的副标题字段标识，未标记时为空
const subtitleKey = computed(() => previewData.value?.user?.ui?.subtitle || "");
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
// 字段被隐藏或值空时不渲染副标题
const content = computed(() => {
  const key = subtitleKey.value;
  if (!key || isUserFieldHidden(key)) return "";
  const value = user.value?.[key];
  if (value == null || value === "") return "";
  return key === "heightWeight" ? heightWeightText(value) : String(value);
});
</script>

<template>
  <div v-if="content" class="max-w-full min-w-0 font-normal">
    <ResumeField :model-value="content" class="flex items-center! justify-center!" />
  </div>
</template>

<style lang="scss" scoped></style>
