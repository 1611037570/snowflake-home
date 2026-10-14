<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 横线间距固定 32px，只作为信笺纹理提示，不参与分页测量
const ruledLinePitch = 32;
const {
  theme: { themeColor },
} = useResumePreviewContext();
// 横线跟随主题色，透明度取 13%：在 1:1 缩放下能看清「信纸」质感，又不会压过正文
const ruledLineColor = computed(() => `${themeColor.value}22`);
const ruledLineImage = computed(
  () => `linear-gradient(to bottom, ${ruledLineColor.value} 1px, transparent 1px)`,
);
</script>

<template>
  <!-- 负层级让横线压在纸张底色之上、正文之下，绝对定位不参与布局 -->
  <div
    aria-hidden="true"
    class="resume-page-pattern pointer-events-none absolute inset-0 -z-10"
    :style="{ backgroundImage: ruledLineImage, backgroundSize: `100% ${ruledLinePitch}px` }"
  />
</template>
