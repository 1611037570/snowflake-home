<script setup>
/**
 * 配置提供器 提供默认背景颜色和颜色
 */
import { DEFAULT_BACKGROUND, DEFAULT_COLOR } from "@/constants";
import { getElLocale } from "@/utils";

defineOptions({ name: "SfConfigProvider" });

provide("bg", DEFAULT_BACKGROUND);
provide("color", DEFAULT_COLOR);
</script>

<template>
  <ElConfigProvider :locale="getElLocale">
    <slot></slot>
  </ElConfigProvider>
</template>

<style lang="scss" scoped></style>
