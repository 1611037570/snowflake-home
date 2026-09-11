<script setup>
import { computed, inject } from "vue";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const fontValue = inject("fontValue");
const themeColor = inject("themeColor");
// 实心色块上自动选择黑白文字，保证深浅主题色下均可读
const textColor = computed(() => {
  const hex = String(themeColor?.value ?? "").replace("#", "");
  if (hex.length < 6) return "#fff";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140 ? "#1f2937" : "#fff";
});
</script>

<template>
  <!-- 活力风格：标题置于主题色实心圆角色块上，视觉醒目 -->
  <div v-if="title" class="pb-3">
    <h2
      class="inline-block max-w-full min-w-0 rounded-lg px-4 py-1 font-bold tracking-wide break-words"
      :style="[{ background: themeColor, color: textColor }, fontValue(5)]"
    >
      {{ title }}
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
