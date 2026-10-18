<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  themeId: { type: String, default: "inkWhiteSpace" }, // 当前主题编号
  moduleKey: { type: String, default: "user" }, // 个人信息模块编号
  moduleClass: { type: String, default: "" }, // 编辑器模块状态类名
});
const { theme: { fontValue, lineHeightValue } } = useResumePreviewContext();
// 个人信息仍由公共组件渲染，变量只调整书页式字体层级。
const userStyle = {
  "--resume-user-name-size": "42px", // 姓名字号
  "--resume-user-name-line-height": "1.25", // 姓名行高
  "--resume-user-name-spacing": "0.24em", // 姓名字距
  "--resume-user-name-weight": "400", // 姓名字重
  "--resume-user-name-color": "#2F3D3A", // 姓名颜色
  "--resume-user-subtitle-size": "14px", // 副标题字号
  "--resume-user-subtitle-spacing": "0.36em", // 副标题字距
  "--resume-user-subtitle-color": "#6F8983", // 副标题颜色
  "--resume-user-contact-label-color": "#8AA49D", // 资料标签颜色
  "--resume-user-avatar-radius": "50%", // 头像圆形裁切
};
</script>

<template>
  <!-- 个人信息下方的细线与留白由该节点测量，正文继续走公共双栏。 -->
  <div
    class="resume-module-wrapper resume-user group group/module relative box-border w-full min-w-0 pb-6"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[fontValue(), lineHeightValue(), userStyle]"
  >
    <slot name="actions" />
    <slot />
    <span aria-hidden="true" class="pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-[#CFDAD6]" />
  </div>
</template>
