<script setup>
import { computed } from "vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import UserSubtitle from "./userSubtitle.vue";
import { useUserFieldVisibility } from "../useUserFieldVisibility";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 姓名组件：字号由主题样式注入
const {
  data: previewData,
  theme: { fontValue, lineHeightValue, infoPosition },
} = useResumePreviewContext();
const user = computed(() => previewData.value?.user?.data || {});
const { isUserFieldHidden } = useUserFieldVisibility();
// 信息位置对应的水平对齐类名
const INFO_ALIGN_CLASS = {
  left: "items-start",
  center: "items-center",
  right: "items-end",
};
// 姓名与副标题的水平对齐跟随信息位置，避免副标题较长时姓名被居中
const infoAlignClass = computed(() => INFO_ALIGN_CLASS[infoPosition.value] || "items-start");
// 姓名排版由内容组件读取主题变量，外壳无需穿透内部结构。
const nameStyle = computed(() => ({
  fontSize: `var(--resume-user-name-size, ${fontValue.value(10).fontSize})`, // 姓名字号
  lineHeight: `var(--resume-user-name-line-height, ${lineHeightValue.value().lineHeight})`, // 姓名行高
  letterSpacing: "var(--resume-user-name-spacing, inherit)", // 姓名字距
  color: "var(--resume-user-name-color, inherit)", // 姓名颜色
}));
</script>

<template>
  <div
    v-if="!isUserFieldHidden('name')"
    class="flex max-w-full min-w-0 flex-col font-bold tracking-wide"
    :class="infoAlignClass"
  >
    <ResumeField :model-value="user.name" :style="[fontValue(10), lineHeightValue(), nameStyle]" />
    <UserSubtitle />
  </div>
</template>

<style lang="scss" scoped></style>
