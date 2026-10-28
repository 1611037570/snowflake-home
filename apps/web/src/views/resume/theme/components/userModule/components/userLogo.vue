<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 读取校徽及独立隐藏状态，预览与导出共用眼睛开关的结果。
const { data } = useResumePreviewContext();
const logo = computed(() => {
  const user = data.value?.user;
  return user?.ui?.logo?.hidden ? "" : user?.data?.logo || "";
});
</script>

<template>
  <!-- 保留图片比例，图案在校徽区域内靠顶部显示。 -->
  <img v-if="logo" :src="logo" class="h-[70px] w-[70px] shrink-0 object-contain object-top" alt="校徽" />
</template>

<style lang="scss" scoped></style>
