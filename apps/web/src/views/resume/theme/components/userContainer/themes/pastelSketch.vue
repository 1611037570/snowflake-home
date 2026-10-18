<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  themeId: { type: String, default: "pastelSketch" }, // 当前主题编号
  moduleKey: { type: String, default: "user" }, // 个人信息模块编号
  moduleClass: { type: String, default: "" }, // 编辑器模块状态类名
});
const {
  theme: { fontValue, lineHeightValue, themeColor, themeColorLine },
} = useResumePreviewContext();
// 开放式页眉只调整现有个人信息的字体和头像，不添加姓名下方的内容。
const userStyle = computed(() => ({
  "--resume-user-name-color": themeColor.value, // 姓名使用主题色
  "--resume-user-name-size": "44px", // 放大姓名形成页眉主视觉
  "--resume-user-name-line-height": "1.1", // 姓名行高
  "--resume-user-name-family": '"KaiTi", "STKaiti", "Kaiti SC", serif', // 姓名楷体
  "--resume-user-subtitle-family": '"KaiTi", "STKaiti", "Kaiti SC", serif', // 副标题同为楷体，正文与联系方式仍用通用字体
  "--resume-user-avatar-radius": "9999px", // 头像取圆形
  "--resume-user-avatar-border": "4px solid white", // 头像白色内圈
  "--resume-user-avatar-shadow": `0 0 0 2px ${themeColorLine.value}, 0 12px 24px rgba(91, 69, 84, 0.12)`, // 头像外圈与柔和投影
}));
</script>

<template>
  <!-- 去掉卡片外框，个人信息仍由公共内容组件排版；底部留出让文字与下方细线拉开距离。 -->
  <div
    class="resume-module-wrapper resume-user group group/module relative box-border w-full min-w-0 pb-6"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[lineHeightValue(), fontValue(), userStyle]"
  >
    <slot name="actions" />
    <div class="relative min-w-0"><slot /></div>
    <span aria-hidden="true" class="pointer-events-none absolute right-0 bottom-0 left-0 h-px" :style="{ backgroundColor: themeColorLine }" />
  </div>
</template>
