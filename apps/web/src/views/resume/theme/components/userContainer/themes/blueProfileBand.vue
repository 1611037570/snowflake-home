<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  themeId: { type: String, default: "blueProfileBand" }, // 当前主题编号
  moduleKey: { type: String, default: "user" }, // 个人信息模块编号
  moduleClass: { type: String, default: "" }, // 编辑器模块状态类名
});
const { theme: { fontValue, lineHeightValue, themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 横向资料头部沿用通用个人信息内容，仅绘制浅灰背景与方形头像。 -->
  <div
    class="resume-module-wrapper resume-user group group/module relative box-border w-full min-w-0 bg-[#F7F8FA] p-6"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[fontValue(), lineHeightValue(), { '--resume-user-name-size': '40px', '--resume-user-name-color': themeColor, '--resume-user-avatar-width': '132px', '--resume-user-avatar-height': '132px', '--resume-user-avatar-radius': '0' }]"
  >
    <slot name="actions" />
    <slot />
  </div>
</template>
