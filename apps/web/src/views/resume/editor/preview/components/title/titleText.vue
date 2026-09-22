<script setup>
import { computed, inject } from "vue";
import { useResumePreviewContext } from "../../previewContext";

// 标题文本：按模块标题图标模式在文字前展示图标，各风格主题统一复用
defineProps({
  title: {
    type: String,
    default: "",
  },
});
// 模块图标与尺寸由标题入口注入，无图标模式时图标为空
const icon = inject(
  "moduleIcon",
  computed(() => ""),
);
const iconSize = inject(
  "titleIconSize",
  computed(() => 0),
);
// 标题文字直接使用模块标题字号，避免被正文字号覆盖
const {
  theme: { titleFontStyle, titleIconMode, themeColor, themeColorContrast },
} = useResumePreviewContext();
</script>

<template>
  <!-- 图标独立于文字排版，不参与标题换行；带背景模式使用主题色填充 -->
  <div class="flex shrink-0 items-center">
    <span
      v-if="icon"
      class="mr-1 inline-flex items-center justify-center rounded"
      :style="
        titleIconMode === 'filled'
          ? { backgroundColor: themeColor, color: themeColorContrast, padding: '2px' }
          : undefined
      "
    >
      <SfIcon :icon="icon" :size="iconSize" />
    </span>
    <span :style="[titleFontStyle]">{{ title }}</span>
  </div>
</template>

<style lang="scss" scoped></style>
