<script setup lang="ts">
defineProps<{
  level: number; // 熟练度档位
  color: string; // 分数字体颜色
}>();
</script>

<template>
  <span class="shrink-0 font-bold" :style="{ color }">{{ level * 2 }}分</span>
</template>
