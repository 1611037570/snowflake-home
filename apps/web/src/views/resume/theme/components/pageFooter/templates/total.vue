<script setup lang="ts">
defineProps<{ text: string /* 当前页与总页数模板的页尾文案 */ }>();
</script>

<template>
  <span>{{ text }}</span>
</template>
