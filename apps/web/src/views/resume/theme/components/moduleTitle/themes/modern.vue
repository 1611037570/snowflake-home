<script setup>
import { computed } from "vue";
import TitleText from "../titleText.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: {
    type: String,
    default: "",
  },
});
const {
  theme: { themeColor, themeColorSoft },
} = useResumePreviewContext();
// 标题底衬与短横线都取主题色，与正文左侧细条、条目缩进组成同一套视觉语言。
const titleStyle = computed(() => ({
  color: themeColor.value, // 标题文字与短横线颜色
  "--modern-title-soft": themeColorSoft.value, // 标题底衬颜色：主题色 10%
}));
</script>

<template>
  <!-- 现代风格：标题左对齐，底衬与短横线各自呼应左侧细条 -->
  <div class="flex w-full min-w-0 flex-col items-start">
    <h2
      class="modern-title max-w-full min-w-0 font-bold tracking-wide break-words px-3 pt-3 pb-3"
      :style="titleStyle"
    >
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style scoped>
/* 底衬只铺标题文字宽度，右侧留白不参与上色 */
.modern-title {
  position: relative;
  background-color: var(--modern-title-soft);
  border-bottom-left-radius: 3px;
  border-bottom-right-radius: 3px;
}

/* 短横线宽度与正文左侧细条同宽，贴着标题底衬下沿形成呼应 */
.modern-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 12px;
  width: 40px;
  max-width: 100%;
  height: 3px;
  border-radius: 3px;
  background-color: currentColor;
  transform: translateY(3px);
  pointer-events: none;
}
</style>
