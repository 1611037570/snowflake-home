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
  <!-- 内联容器保证图标与标题文字同行并对齐 -->
  <span v-if="icon" class="mr-1 inline-flex align-middle">
    <SfIcon :icon="icon" :size="iconSize" />
  </span>
  <span>{{ title }}</span>
</template>

<style lang="scss" scoped></style>
