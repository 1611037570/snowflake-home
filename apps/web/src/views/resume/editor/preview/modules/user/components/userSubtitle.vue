<script setup>
import dayjs from "dayjs";
import { computed, inject } from "vue";
import ResumeField from "../../../components/resumeField/index.vue";
import { getUserSubtitleKeys } from "@/stores/modules/resume/hooks/useUserSubtitle";
import { useUserFieldVisibility } from "../useUserFieldVisibility";

// 副标题：渲染编辑器中标记的字段值，按标记序号在姓名下方并排展示
const previewData = inject("previewData");
const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
const user = computed(() => previewData.value?.user?.data || {});
// 出生日期副标题沿用字段展示形态，保证切换后即时反映在预览中
const birthdayDisplay = computed(() => previewData.value?.user?.ui?.birthday?.display || "age");
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
  return [hasHeight ? `${height}cm` : "", hasWeight ? `${weight}kg` : ""]
    .filter(Boolean)
    .join(" · ");
};
// 模特三围按胸围、腰围、臀围顺序展示，允许只填写部分数据
const measurementsText = (value) => {
  const measurements = [value?.bust, value?.waist, value?.hip].filter(
    (item) => item != null && item !== "",
  );
  return measurements.length ? measurements.map((item) => `${item}cm`).join(" · ") : "";
};
// 尺码按上装、下装、鞋码顺序展示，允许只填写部分数据
const sizesText = (value) => [
  { key: "top", value: value?.top },
  { key: "bottom", value: value?.bottom },
  { key: "shoes", value: value?.shoes },
]
  .filter((item) => item.value != null && item.value !== "")
  .map((item) => (item.key === "shoes" ? `${item.value}码` : item.value))
  .join(" · ");
// 出生日期按所选展示形态转换为日期或年龄
const birthdayText = (value) => {
  if (birthdayDisplay.value === "date") return String(value);
  const birthday = dayjs(value);
  if (!birthday.isValid()) return "";
  return `${Math.max(0, dayjs().diff(birthday, "year"))}岁`;
};
// 单项内容：字段被隐藏或值空时不展示
const textOf = (key) => {
  if (!key || isUserFieldHidden(key)) return "";
  const value = user.value?.[key];
  if (value == null || value === "") return "";
  if (key === "heightWeight") return heightWeightText(value);
  if (key === "measurements") return measurementsText(value);
  if (key === "sizes") return sizesText(value);
  if (key === "birthday") return birthdayText(value);
  return String(value);
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
