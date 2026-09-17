<script setup>
// 统一标题组件
import ResumeField from "./resumeField/index.vue";
defineProps({
  name: {
    default: "",
  },
});
const fontValue = inject("fontValue");
</script>

<template>
  <div class="font-bold" :style="[fontValue(1)]">
    <ResumeField :model-value="name" />
  </div>
</template>

<style lang="scss" scoped></style>
