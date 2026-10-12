<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  themeId: { type: String, default: "terraCards" }, // 当前主题编号
  moduleKey: { type: String, default: "user" }, // 模块编号
  moduleClass: { type: String, default: "" }, // 编辑器模块状态类名
});

const {
  theme: { fontValue, lineHeightValue, themeColorSoft },
} = useResumePreviewContext();
</script>

<template>
  <!-- 背景层不占布局高度，个人信息内容自身提供可测量的内边距。 -->
  <div
    class="resume-module-wrapper resume-user group group/module relative box-border w-full min-w-0 rounded-[18px]"
    :class="moduleClass"
    :data-module="moduleKey"
    :data-theme="themeId"
    :style="[lineHeightValue(), fontValue(), { backgroundColor: themeColorSoft }]"
  >
    <span aria-hidden="true" class="pointer-events-none absolute inset-y-0 right-0 w-[30%] overflow-hidden rounded-r-[18px]">
      <span class="absolute -top-15 -right-15 h-60 w-60 rounded-full" :style="{ backgroundColor: themeColorSoft }" />
    </span>
    <slot name="actions" />
    <div class="relative min-w-0"><slot /></div>
  </div>
</template>
