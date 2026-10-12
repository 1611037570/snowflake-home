<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  moduleKey: { type: String, default: "" }, // 模块编号
  moduleClass: { type: String, default: "" }, // 编辑器模块状态类名
});
const { theme: { themeColorSoft } } = useResumePreviewContext();
</script>

<template>
  <!-- 卡片只绘制底色与圆角，标题和条目的留白由各自可测量的节点提供。 -->
  <div
    class="resume-module-wrapper group group/module relative box-border flex min-w-0 flex-col"
    :class="[moduleClass, moduleKey === 'slogan' ? '' : 'rounded-[18px]']"
    :data-module="moduleKey"
    :style="moduleKey === 'slogan' ? undefined : { backgroundColor: themeColorSoft }"
  >
    <slot name="actions" />
    <slot name="title" />
    <slot />
  </div>
</template>
