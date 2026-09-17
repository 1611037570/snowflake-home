<script setup>
import { inject } from "vue";
import TitleText from "../titleText.vue";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const fontValue = inject("fontValue");
const themeColor = inject("themeColor");
</script>

<template>
  <!-- 经典风格：标题下方通栏主题色粗线，正文区以分节线呼应 -->
  <div v-if="title" class="border-b" :style="{ borderBottomWidth: '2px', borderColor: themeColor }">
    <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
