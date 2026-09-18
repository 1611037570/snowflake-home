<script setup>
import { computed, inject } from "vue";
import ResumeField from "../../../components/resumeField/index.vue";
import UserSubtitle from "./userSubtitle.vue";
import { useUserFieldVisibility } from "../useUserFieldVisibility";

// 姓名组件：字号由主题样式注入
const previewData = inject("previewData");
const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
const user = computed(() => previewData.value?.user?.data || {});
const { isUserFieldHidden } = useUserFieldVisibility();
// 信息位置对应的水平对齐类名
const INFO_ALIGN_CLASS = {
  left: "items-start",
  center: "items-center",
  right: "items-end",
};
// 姓名与副标题的水平对齐跟随信息位置，避免副标题较长时姓名被居中
const infoPosition = inject(
  "infoPosition",
  computed(() => "left"),
);
const infoAlignClass = computed(() => INFO_ALIGN_CLASS[infoPosition.value] || "items-start");
</script>

<template>
  <div
    v-if="!isUserFieldHidden('name')"
    class="flex max-w-full min-w-0 flex-col font-bold tracking-wide"
    :class="infoAlignClass"
  >
    <ResumeField :model-value="user.name" :style="[fontValue(10), lineHeightValue()]" />
    <UserSubtitle />
  </div>
</template>

<style lang="scss" scoped></style>
