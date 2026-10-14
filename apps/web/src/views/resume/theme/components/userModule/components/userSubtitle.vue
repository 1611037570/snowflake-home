<script setup>
import dayjs from "dayjs";
import { computed } from "vue";
import InlineInfoList from "@/views/resume/editor/preview/components/inlineInfoList.vue";
import { getUserSubtitleKeys } from "@/stores/modules/resume/hooks/useUserSubtitle";
import { useUserFieldVisibility } from "../useUserFieldVisibility";
import { getInfoSeparatorMark } from "@/domain/resume/theme/uiConfig";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 副标题：渲染编辑器中标记的字段值，按标记序号在姓名下方并排展示
const {
  data: previewData,
  theme: { fontValue, lineHeightValue, infoSeparator },
} = useResumePreviewContext();
const user = computed(() => previewData.value?.user?.data || {});
// 出生日期副标题沿用字段展示形态，保证切换后即时反映在预览中
const birthdayDisplay = computed(() => previewData.value?.user?.ui?.birthday?.display || "age");
// 已标记的副标题字段：按标记序号升序
const subtitleKeys = computed(() => getUserSubtitleKeys(previewData.value?.user?.ui));
const { isUserFieldHidden } = useUserFieldVisibility();
// 身高体重为对象值，按身高与体重拼接成文本展示
const joinInfo = (items) => {
  const mark = getInfoSeparatorMark(infoSeparator.value);
  return items.filter(Boolean).join(mark ? ` ${mark} ` : " ");
};
const heightWeightText = (value) => {
  const height = value?.height;
  const weight = value?.weight;
  const hasHeight = height != null && height !== "";
  const hasWeight = weight != null && weight !== "";
  if (!hasHeight && !hasWeight) return "";
  return joinInfo([hasHeight ? `${height}cm` : "", hasWeight ? `${weight}kg` : ""]);
};
// 模特三围按胸围、腰围、臀围顺序展示，允许只填写部分数据
const measurementsText = (value) => {
  const measurements = [value?.bust, value?.waist, value?.hip].filter(
    (item) => item != null && item !== "",
  );
  return measurements.length ? joinInfo(measurements.map((item) => `${item}cm`)) : "";
};
// 尺码按上装、下装、鞋码顺序展示，允许只填写部分数据
const sizesText = (value) =>
  joinInfo(
    [
      { key: "top", value: value?.top },
      { key: "bottom", value: value?.bottom },
      { key: "shoes", value: value?.shoes },
    ]
      .filter((item) => item.value != null && item.value !== "")
      .map((item) => (item.key === "shoes" ? `${item.value}码` : item.value)),
  );
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
// 副标题样式由自身消费主题变量，类规则写法不会压过主题的既有声明。
</script>

<template>
  <InlineInfoList
    v-if="items.length"
    :items="items"
    class="resume-user-subtitle mt-3 font-normal"
    :style="[fontValue(), lineHeightValue()]"
  />
</template>

<style lang="scss" scoped>
/* 副标题外观统一读取主题变量，未声明时保持公共观感。 */
.resume-user-subtitle {
  font-size: var(--resume-user-subtitle-size, inherit); // 副标题字号
  font-weight: var(--resume-user-subtitle-weight, normal); // 副标题字重
  font-family: var(--resume-user-subtitle-family, inherit); // 副标题字体族
  letter-spacing: var(--resume-user-subtitle-spacing, inherit); // 副标题字距
  color: var(--resume-user-subtitle-color, var(--resume-user-name-color, inherit)); // 副标题文字色，未声明时跟随姓名
  background-color: var(--resume-user-subtitle-background, transparent); // 副标题底纹色
  padding: var(--resume-user-subtitle-padding, 0); // 副标题底纹内留白
  text-shadow: var(--resume-user-subtitle-shadow, none); // 副标题文字阴影
}
</style>
