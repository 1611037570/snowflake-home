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
  <!-- 经典风格：标题下方使用通栏主题色细线，正文区以分节线呼应 -->
  <div
    v-if="title"
    class="border-b pb-[3px]"
    :style="{ borderBottomWidth: '1px', borderColor: themeColor }"
  >
    <h2 class="max-w-full min-w-0 font-bold tracking-wide break-words">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
