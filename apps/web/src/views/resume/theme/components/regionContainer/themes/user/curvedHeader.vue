<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolveBandStyle } from "../../bandStyle";

const {
  ui,
  theme: { themeColor },
} = useResumePreviewContext();
// 通栏外扩复用区域留白算法，使预览、测量与导出保持相同几何。
const bandStyle = computed(() => resolveBandStyle(ui.value, "user", { roundTop: true }));
</script>

<template>
  <!-- 弧形仅作背景，圆角沿用页面设置，个人信息仍参与正常排版。 -->
  <div class="relative flex w-full min-w-0" :style="bandStyle">
    <svg
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 h-[126px] w-full [border-radius:inherit]"
      viewBox="0 0 1000 156"
      preserveAspectRatio="none"
      :style="{ fill: themeColor }"
    >
      <path d="M0 0H1000V116Q500 196 0 116Z" />
    </svg>
    <slot />
  </div>
</template>
