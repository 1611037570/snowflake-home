<script setup lang="ts">
defineProps<{ text: string /* 文字页码模板的页尾文案 */ }>();
</script>

<template>
  <span>{{ text }}</span>
</template>
