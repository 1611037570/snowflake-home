<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
// 页眉仅提供背景、几何装饰与通用个人信息组件读取的文字变量。
const headerStyle = computed(() => ({
  backgroundColor: themeColor.value, // 页眉底色
  "--resume-user-name-size": "54px", // 姓名大标题字号
  "--resume-user-name-color": "#FFFFFF", // 姓名反白
  "--resume-user-name-weight": "800", // 姓名加重
  "--resume-user-subtitle-size": "15px", // 副标题字号
  "--resume-user-subtitle-color": "#FFFFFF", // 副标题反白
  "--resume-user-subtitle-spacing": "0.2em", // 副标题加宽字距
  "--resume-user-contact-gap": "18px", // 联系资料的横向间距
  "--resume-user-contact-label-color": "#FFFFFF", // 联系资料标签反白
}));
</script>

<template>
  <!-- 装饰由外壳绘制，个人信息内容继续复用公共组件。 -->
  <div class="crimson-geometry-header relative box-border flex min-h-[192px] w-full min-w-0 items-center text-white" :style="headerStyle">
    <div class="relative z-10 min-w-0 max-w-[72%]"><slot /></div>
  </div>
</template>

<style scoped>
.crimson-geometry-header::before,
.crimson-geometry-header::after {
  content: "";
  position: absolute;
  pointer-events: none;
}

/* 金色日轮与深蓝三角错位，形成与参考图不同的几何组合。 */
.crimson-geometry-header::before {
  top: 27px;
  right: 67px;
  width: 63px;
  height: 63px;
  border-radius: 50%;
  background: #f4c91f;
}

.crimson-geometry-header::after {
  right: 126px;
  bottom: 24px;
  width: 69px;
  height: 65px;
  background: #173455;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}
</style>
