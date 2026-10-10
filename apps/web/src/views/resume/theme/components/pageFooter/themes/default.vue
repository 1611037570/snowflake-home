<script setup lang="ts">
defineProps<{ text: string /* 品牌与页码文案 */ }>();
</script>

<template>
  <span>{{ text }}</span>
</template>
