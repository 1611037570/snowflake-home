<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
// 页眉只绘制主题装饰，姓名、副标题、资料和头像仍由公共个人信息组件提供。
const appearanceStyle = computed(() => ({
  "--resume-orbit-color": themeColor.value, // 页眉底色跟随主题色
  "--resume-user-name-size": "56px", // 页眉姓名的醒目字号
  "--resume-user-name-line-height": "1.12", // 姓名行高
  "--resume-user-name-spacing": "0.12em", // 姓名字距
  "--resume-user-name-color": "#FFFFFF", // 深色背景上的姓名颜色
  "--resume-user-subtitle-size": "15px", // 副标题字号
  "--resume-user-subtitle-spacing": "0.22em", // 副标题字距
  "--resume-user-subtitle-color": "#F4F1FF", // 副标题文字颜色
  "--resume-user-avatar-width": "108px", // 头像宽度
  "--resume-user-avatar-height": "108px", // 头像高度
  "--resume-user-avatar-radius": "50%", // 头像使用圆形裁切
  "--resume-user-avatar-border": "3px solid #FFFFFF", // 头像与背景分离
}));
</script>

<template>
  <!-- 圆形只作为背景装饰，真实个人信息始终保持可编辑和可测量。 -->
  <div class="indigo-orbit-user relative flex w-full min-w-0 overflow-hidden text-white" :style="appearanceStyle">
    <span aria-hidden="true" class="orbit-label absolute z-10 inline-flex h-6 items-center rounded-full border border-white/60 px-3 text-[11px] tracking-[0.32em]">PROFILE</span>
    <slot />
  </div>
</template>

<style scoped>
.indigo-orbit-user {
  background: linear-gradient(110deg, color-mix(in srgb, var(--resume-orbit-color) 82%, #181B38), var(--resume-orbit-color));
}

.orbit-label {
  top: 36px;
  left: var(--resume-page-inset-horizontal);
}

.indigo-orbit-user::before {
  content: "";
  position: absolute;
  width: 245px;
  height: 245px;
  top: -104px;
  right: -64px;
  border-radius: 50%;
  background: #BBA6E8;
}

.indigo-orbit-user::after {
  content: "";
  position: absolute;
  width: 170px;
  height: 170px;
  right: 115px;
  bottom: -132px;
  border: 18px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
}
</style>
