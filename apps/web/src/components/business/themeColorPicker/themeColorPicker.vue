<script setup>
import { themeColors } from "@/domain/resume/theme/uiConfig";

const modelValue = defineModel("modelValue", {
  type: String,
  default: "",
});

const normalizeColor = (value) => String(value || "").toLowerCase();
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <button
      v-for="colorItem in themeColors"
      :key="colorItem.value"
      type="button"
      class="h-6 w-6 cursor-pointer rounded-full border border-sf-b transition-all duration-200 hover:scale-110"
      :class="{
        'border-2 border-sf-theme': normalizeColor(modelValue) === normalizeColor(colorItem.value),
      }"
      :style="{
        backgroundColor: colorItem.value,
      }"
      @click="modelValue = colorItem.value"
    />
  </div>
</template>

<style lang="scss" scoped></style>
