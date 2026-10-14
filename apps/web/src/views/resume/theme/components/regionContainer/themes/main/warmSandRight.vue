<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
// 右栏底色沿用公共栏位尺寸，个人信息仍由公共组件完整渲染。
const appearanceStyle = computed(() => ({
  "--warm-sand-accent": themeColor.value, // 右栏分隔线跟随主题色
  "--resume-user-name-size": "31px", // 窄栏姓名字号
  "--resume-user-name-line-height": "1.2", // 姓名行高
  "--resume-user-name-color": "#513D2D", // 姓名使用深棕色
  "--resume-user-avatar-width": "108px", // 头像宽度
  "--resume-user-avatar-height": "108px", // 头像高度
  "--resume-user-avatar-radius": "50%", // 头像使用圆形裁切
  "--resume-user-avatar-border": "3px solid #FFFFFF", // 头像与资料栏底色分离
  "--resume-user-contact-label-color": "#765942", // 联系方式标签颜色
}));
</script>

<template>
  <!-- 右栏底色从现有栏位延伸到纸张边缘，不改变公共分栏与分页尺寸。 -->
  <div class="warm-sand-main isolate" :style="appearanceStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use "../../columnBleed" as *;

.warm-sand-main :deep(> [data-resume-column="right"]) {
  isolation: isolate;
}

.warm-sand-main :deep(> [data-resume-column="right"])::before {
  @include column-bleed(right);
  background: #F3EBDD;
  border-left: 1px solid color-mix(in srgb, var(--warm-sand-accent) 38%, white);
}
</style>
