<script setup>
// 统一条目标题组件，强调样式由日期位置动态决定
import ResumeField from "./resumeField/index.vue";
const { emphasis = true } = defineProps({
  name: {
    default: "",
  },
  emphasis: {
    type: Boolean,
    default: true,
  },
});
const fontValue = inject("fontValue");
</script>

<template>
  <div :class="{ 'font-bold': emphasis }" :style="[fontValue(emphasis ? 1 : 0)]">
    <ResumeField :model-value="name" />
  </div>
</template>

<style lang="scss" scoped></style>
