<script setup>
import { computed, inject } from "vue";
import DiffField from "../../../components/diffField/index.vue";

// 姓名组件：字号由主题样式注入
const previewData = inject("previewData");
const fontValue = inject("fontValue");
const user = computed(() => previewData.value?.user?.data || {});
</script>

<template>
  <h1 class="min-w-0 max-w-full font-bold tracking-wide" :style="[fontValue(14)]">
    <DiffField v-model="user.name" />
  </h1>
</template>

<style lang="scss" scoped></style>
