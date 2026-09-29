<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "../../../../shared/previewContext";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
// 线条色：统一由主题色推导，线框模板默认取纯黑
const {
  theme: { themeColor },
} = useResumePreviewContext();
</script>

<template>
  <!-- 线框风格：标题位于模块外框顶部，下方一条通栏细线分隔内容 -->
  <div
    class="border-b px-3 pt-3 pb-3"
    :style="{ borderBottomWidth: '1px', borderColor: themeColor }"
  >
    <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
