<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { resolveBandStyle } from "../bandStyle";

// 个人信息通栏外观：让个人信息整块铺满页面宽度并铺上主题色底纹。
// 外扩与留白走 bandStyle.ts 的同一份算法，色带高度与分页口径不额外变化。
const {
  ui,
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();

const bandStyle = computed(() => ({
  ...resolveBandStyle(ui.value, "user", { roundTop: true }),
  backgroundColor: themeColor.value,
  color: themeColorContrast.value,
}));
</script>

<template>
  <!-- 区域容器保持行方向：栏位用 flex-basis 表达宽度 -->
  <div class="relative flex w-full min-w-0" :style="bandStyle">
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
