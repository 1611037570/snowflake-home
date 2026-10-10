<script setup>
import { resolveSloganComponent } from "./registry";

// 用户标语与主题占位装饰分离，内容只来自简历字段。
const current = resolveSloganComponent();
</script>

<template>
  <component :is="current" />
</template>
