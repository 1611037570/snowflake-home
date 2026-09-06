<script setup>
import { computed, inject } from "vue";
import ResumeField from "../../../components/resumeField/index.vue";

// 姓名组件：字号由主题样式注入
const previewData = inject("previewData");
const fontValue = inject("fontValue");
const user = computed(() => previewData.value?.user?.data || {});
</script>

<template>
  <div class="max-w-full min-w-0 font-bold tracking-wide" :style="[fontValue(14)]">
    <ResumeField
      v-model="user.name"
      class="flex items-center! justify-center!"
      :style="[fontValue(14)]"
    />
  </div>
</template>

<style lang="scss" scoped></style>
