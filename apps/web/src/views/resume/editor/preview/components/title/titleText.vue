<script setup>
import { computed, inject } from "vue";

// 标题文本：按「标题图标」开关在文字前展示模块图标，各风格主题统一复用
defineProps({
  title: {
    type: String,
    default: "",
  },
});
// 模块图标与尺寸由标题入口注入，未开启时图标为空
const icon = inject(
  "titleIcon",
  computed(() => ""),
);
const iconSize = inject(
  "titleIconSize",
  computed(() => 0),
);
const fontValue = inject("fontValue");
</script>

<template>
  <!-- 图标独立于文字排版，不参与标题换行；关闭图标开关时仅隐藏图标 -->
  <div class="flex shrink-0 items-center">
    <SfIcon v-if="icon" :icon="icon" :size="iconSize" class="mr-1" />
    <span :style="[fontValue(1)]">{{ title }}</span>
  </div>
</template>

<style lang="scss" scoped></style>
