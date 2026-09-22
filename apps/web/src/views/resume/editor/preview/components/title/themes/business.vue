<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "../../../previewContext";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 商务风格：左侧主题色直角竖条 + 底部主题色粗线 -->
  <div v-if="title" class="border-b-2" :style="{ borderColor: themeColor }">
    <div class="flex items-center">
      <div class="mr-3 h-4 w-1" :style="{ background: themeColor }"></div>
      <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words">
        <TitleText :title="title" />
      </h2>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
