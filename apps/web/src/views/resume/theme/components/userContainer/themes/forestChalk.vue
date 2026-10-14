<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  themeId: { type: String, default: "forestChalk" }, // 当前主题编号
  moduleKey: { type: String, default: "user" }, // 个人信息模块编号
  moduleClass: { type: String, default: "" }, // 编辑器模块状态类名
});
const { theme: { fontValue, lineHeightValue } } = useResumePreviewContext();
// 姓名、副标题与资料的外观全部由公共组件读取变量，外壳不再穿透内部类名。
const appearanceStyle = {
  "--resume-user-name-size": "48px", // 姓名字号
  "--resume-user-name-line-height": "1.1", // 姓名行高
  "--resume-user-name-spacing": "0.08em", // 姓名字距
  "--resume-user-name-color": "#F6F7EE", // 姓名颜色，贴合深绿纸面
  "--resume-user-name-family": '"KaiTi", "STKaiti", "Kaiti SC", serif', // 姓名楷体
  "--resume-user-subtitle-family": '"KaiTi", "STKaiti", "Kaiti SC", serif', // 副标题同样取楷体
  "--resume-user-subtitle-color": "#F2DEA0", // 副标题浅金色，形成第二层级
  "--resume-user-subtitle-size": "18px", // 副标题字号
  "--resume-user-subtitle-weight": "700", // 副标题字重
  "--resume-user-subtitle-spacing": "0.12em", // 副标题字距
  "--resume-user-contact-gap": "3px", // 资料行距收紧
  "--resume-user-contact-align": "right", // 窄栏资料右对齐贴住头像
};
</script>

<template>
  <!-- 透明页眉保留纸纹，底线将个人信息与双栏正文分开。 -->
  <div
    class="resume-module-wrapper resume-user group group/module relative box-border w-full min-w-0 pb-6"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[fontValue(), lineHeightValue(), appearanceStyle]"
  >
    <slot name="actions" />
    <slot />
    <span aria-hidden="true" class="absolute right-0 bottom-0 left-0 h-[2px] bg-[#B8D5C8]/70" />
  </div>
</template>
