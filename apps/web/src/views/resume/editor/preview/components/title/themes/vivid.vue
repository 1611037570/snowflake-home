<script setup>
import { inject } from "vue";
import TitleText from "../titleText.vue";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const themeColor = inject("themeColor");
// 对比文字色：统一由主题色推导，保证深浅主题色下文字均可读
const themeColorContrast = inject("themeColorContrast");
</script>

<template>
  <!-- 活力风格：标题置于主题色实心圆角色块上，视觉醒目 -->
  <div v-if="title">
    <h2
      class="inline-block max-w-full min-w-0 rounded-lg px-4 py-1 font-bold tracking-wide break-words"
      :style="[{ background: themeColor, color: themeColorContrast }]"
    >
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
