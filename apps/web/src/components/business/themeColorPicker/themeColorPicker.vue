<script setup>
import { themeColors } from "@/stores/modules/resume/uiConfig";

const modelValue = defineModel("modelValue", {
  type: String,
  default: "",
});

// 主题色预设色板，供取色器快捷选择
const predefineColors = themeColors.map((item) => item.value);
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <div
      v-for="colorItem in themeColors"
      :key="colorItem.value"
      class="h-6 w-6 cursor-pointer rounded-full transition-all duration-200 hover:scale-110"
      :class="{
        'border-2 border-sf-base': modelValue === colorItem.value,
      }"
      :style="{
        backgroundColor: colorItem.value,
      }"
      @click="modelValue = colorItem.value"
    ></div>
    <el-color-picker v-model="modelValue" size="large" :predefine="predefineColors" />
  </div>
</template>

<style lang="scss" scoped></style>
