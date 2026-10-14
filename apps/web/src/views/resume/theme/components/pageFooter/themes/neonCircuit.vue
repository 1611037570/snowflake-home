<script setup lang="ts">
defineProps<{ text: string /* 公共页面生成的品牌与页码文案 */ }>();
</script>

<template>
  <!-- 深色纸张上的页码改用可读的青色。 -->
  <span class="text-[#78DCD9]">{{ text }}</span>
</template>
