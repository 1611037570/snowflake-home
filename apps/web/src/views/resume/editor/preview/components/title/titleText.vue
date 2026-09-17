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
</script>

<template>
  <!-- 图标独立于文字排版，不参与标题换行 -->
  <div v-if="icon" class="flex shrink-0 items-center">
    <SfIcon :icon="icon" :size="iconSize" class="mr-1" />
    <span>{{ title }}</span>
  </div>
</template>

<style lang="scss" scoped></style>
