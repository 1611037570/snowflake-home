<script setup>
import { computed, inject } from "vue";

// 头像组件：位置与间距由使用方通过 class 控制
const previewData = inject("previewData");
const user = computed(() => previewData.value?.user || {});
</script>

<template>
  <img
    v-if="user.avatar?.value"
    :src="user.avatar?.value"
    alt="头像"
    class="h-[98px] w-[70px] shrink-0 rounded object-cover"
  />
</template>

<style lang="scss" scoped></style>
