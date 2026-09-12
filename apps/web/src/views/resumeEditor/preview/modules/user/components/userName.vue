<script setup>
import { computed, inject } from "vue";
import ResumeField from "../../../components/resumeField/index.vue";
import { useUserFieldVisibility } from "../useUserFieldVisibility";

// 姓名组件：字号由主题样式注入
const previewData = inject("previewData");
const fontValue = inject("fontValue");
const user = computed(() => previewData.value?.user?.data || {});
const { isUserFieldHidden } = useUserFieldVisibility();
</script>

<template>
  <div v-if="!isUserFieldHidden('name')" class="max-w-full min-w-0 font-bold tracking-wide" :style="[fontValue(14)]">
    <ResumeField
      :model-value="user.name"
      class="flex items-center! justify-center!"
      :style="[fontValue(14)]"
    />
  </div>
</template>

<style lang="scss" scoped></style>
