<template>
  <!-- 配置分组容器：标题 + 内容插槽 -->
  <div class="flex flex-col gap-3 rounded-3xl border border-sf-b p-3">
    <div class="text-base font-bold text-sf-text">{{ title }}</div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<style scoped></style>
