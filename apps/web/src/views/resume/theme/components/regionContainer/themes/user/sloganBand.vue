<script>
import { defaultPaddingVertical } from "@/stores/modules/resume/config/uiConfig";

// 标语独立贴顶，页面上边距留给其后的个人信息内容。
const regionPadding = (ui) => ({
  top: Math.max(0, Number(ui?.page?.padding?.vertical ?? defaultPaddingVertical) || 0), // 个人信息距标语的内部上留白
  right: 0, // 不增加右侧留白
  bottom: 0, // 不增加底部留白
  left: 0, // 不增加左侧留白
});
export default { regionPadding /* 分页与区域组件共用的内部留白 */ };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { ui } = useResumePreviewContext();
const contentStyle = computed(() => ({
  paddingTop: `${regionPadding(ui.value).top}px`, // 渲染与分页使用同一上留白
}));
</script>

<template>
  <div class="relative box-border flex w-full min-w-0" :style="contentStyle">
    <slot />
  </div>
</template>
