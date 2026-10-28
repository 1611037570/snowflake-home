<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolveSchoolLogoSize } from "@/domain/resume/theme/schoolLogo";

// 读取校徽及独立隐藏状态，预览与导出共用眼睛开关的结果。
const { data, ui } = useResumePreviewContext();
const logo = computed(() => {
  const user = data.value?.user;
  return user?.ui?.logo?.hidden ? "" : user?.data?.logo || "";
});
// 预览与导出读取同一份大小参数，保持上传裁切确定的比例。
const logoStyle = computed(() => {
  const size = resolveSchoolLogoSize(ui.value?.user?.logo);
  return {
    width: `${size.width}px`, // 校徽展示宽度。
    height: `${size.height}px`, // 按已保存比例计算的高度。
  };
});
</script>

<template>
  <!-- 保留图片比例，图案在校徽区域内靠顶部显示。 -->
  <img v-if="logo" :src="logo" :style="logoStyle" class="shrink-0 object-contain object-top" alt="校徽" />
</template>

<style lang="scss" scoped></style>
