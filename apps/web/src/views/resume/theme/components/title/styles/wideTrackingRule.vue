<script setup>
import TitleText from "../titleText.vue";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
</script>

<template>
  <!-- 宽字距标题与中性细线适用于完整主题和独立极简主题。 -->
  <h2 class="min-w-0 border-b border-[#DADDE1] pb-3 font-extrabold tracking-[0.36em] uppercase break-words">
    <!-- 标题文字显式使用深色，避免预览容器的文字色覆盖。 -->
    <TitleText :title="title" :style="{ color: '#1B2635' }" />
  </h2>
</template>
