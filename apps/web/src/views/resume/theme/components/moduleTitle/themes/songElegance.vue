<script setup>
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  // 当前模块的标题文字
  title: {
    type: String,
    default: "",
  },
});
const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
</script>

<template>
  <!-- 双线夹标题：上方一条贯穿细线，下方一条短粗线，字距放宽获得宋体排版的呼吸感 -->
  <h2
    class="song-elegance-title relative box-border min-w-0 pt-3 pb-3 font-bold tracking-[0.16em]"
    :style="{ color: themeColor, '--song-title-rule': themeColorLine }"
  >
    <span aria-hidden="true" class="song-elegance-title__rule" />
    <TitleText :title="title" />
    <span aria-hidden="true" class="song-elegance-title__accent" />
  </h2>
</template>

<style scoped>
/* 贯穿细线绝对定位，标题高度只由内边距与文字行高决定，与分页测量保持一致 */
.song-elegance-title__rule {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 1px;
  background: var(--song-title-rule);
}

/* 短粗线贴在标题左下方，与上方长细线形成一长一短的对比 */
.song-elegance-title__accent {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 28px;
  height: 2px;
  background: currentColor;
}
</style>
