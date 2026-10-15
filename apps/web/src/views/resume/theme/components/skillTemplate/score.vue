<script setup lang="ts">
defineProps<{
  level: number; // 一到十分的技能评分
  color: string; // 分数字体颜色
}>();
</script>

<template>
  <span class="shrink-0 font-bold" :style="{ color }">{{ level }}分</span>
</template>
