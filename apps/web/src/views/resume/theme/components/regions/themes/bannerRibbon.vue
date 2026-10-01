<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolveBandStyle } from "../bandStyle";

// 顶部标语飘带外观：通栏色带基础上，底沿用绝对定位画一条对比色细线。
// 细线不参与布局，色带高度与分页口径与 banner 外观完全一致。
const {
  ui,
  theme: { themeColor, themeColorContrast, themeColorLine },
} = useResumePreviewContext();

const bandStyle = computed(() => ({
  ...resolveBandStyle(ui.value, "slogan", { roundTop: true }),
  backgroundColor: themeColor.value,
  color: themeColorContrast.value,
}));

// 底部装饰细线：压在色带下沿，不占高度
const ribbonStyle = computed(() => ({ backgroundColor: themeColorLine.value }));
</script>

<template>
  <!-- 区域容器保持行方向：栏位用 flex-basis 表达宽度 -->
  <div class="relative flex w-full min-w-0" :style="bandStyle">
    <slot />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 bottom-0 h-1"
      :style="ribbonStyle"
    />
  </div>
</template>

<style lang="scss" scoped></style>
