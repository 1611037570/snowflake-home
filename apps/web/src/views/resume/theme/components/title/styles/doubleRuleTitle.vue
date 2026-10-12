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
  <!-- 双线夹标题：上方细线贯穿，下方粗线随标题文字宽度延伸。 -->
  <h2
    class="song-elegance-title relative box-border min-w-0 pt-3 font-bold tracking-[0.16em]"
    :style="{ color: themeColor, '--song-title-rule': themeColorLine }"
  >
    <span aria-hidden="true" class="song-elegance-title__rule" />
    <div class="relative w-fit max-w-full pb-3">
      <TitleText :title="title" />
      <span aria-hidden="true" class="song-elegance-title__accent" />
    </div>
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

/* 粗线以标题文字容器为基准，长度随标题变化。 */
.song-elegance-title__accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: currentColor;
}
</style>
