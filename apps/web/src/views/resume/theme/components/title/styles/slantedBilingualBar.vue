<script setup>
import { computed } from "vue";
import TitleText from "../titleText.vue";
import { getPreviewTitle } from "@/views/resume/editor/preview/shared/i18n";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  title: { type: String, default: "" }, // 当前模块标题
  moduleKey: { type: String, default: "" }, // 模块编号，用于查询英文标题
});
const {
  theme: { themeColor },
} = useResumePreviewContext();
// 深灰底带按参考图写死，斜块与中文标题跟随主题色
const bandColor = "#4A4E57";
// 斜切角度取自参考图，底带左右边缘、斜块与左侧斜条共用同一角度
const slantDeg = 24;
// 双语标题始终优先展示中文，自定义中文标题保持用户原文
const chineseTitle = computed(() =>
  /[\u3400-\u9FFF]/u.test(props.title)
    ? props.title
    : getPreviewTitle(props.moduleKey, "zh") || props.title,
);
// 已有模块取英文名称，自定义模块保留自身标题作为副标题
const englishTitle = computed(() => getPreviewTitle(props.moduleKey, "en") || props.title);
</script>

<template>
  <!-- 斜切双语：深灰斜切底带承载中英双语标题，右端收成细尾并压一块主题色斜块。 -->
  <div class="flex min-w-0 items-center">
    <!-- 左侧独立斜条与底带同角度 -->
    <span
      aria-hidden="true"
      class="mr-[0.3em] h-[1.9em] w-[0.5em] shrink-0 rounded-[0.15em]"
      :style="{ backgroundColor: bandColor, transform: `rotate(${slantDeg}deg)` }"
    />
    <div class="relative flex min-w-0 flex-1 items-center">
      <!-- 细尾与底带顶部对齐，自斜切处延伸到栏末 -->
      <span
        aria-hidden="true"
        class="absolute top-0 right-0 left-[0.8em] h-[0.55em]"
        :style="{ backgroundColor: bandColor }"
      />
      <!-- 底带宽度随标题文字增长，左右边缘按参考图斜切 -->
      <div
        class="slanted-bilingual-band relative flex w-fit max-w-full items-center pr-[0.7em] pl-[1em]"
        :style="{ backgroundColor: bandColor }"
      >
        <h2 class="min-w-0 leading-none font-bold break-words" :style="{ color: themeColor }">
          <TitleText :title="chineseTitle" />
        </h2>
        <span class="ml-[1em] shrink-0 leading-none tracking-wide text-white">{{ englishTitle }}</span>
        <span
          aria-hidden="true"
          class="ml-[3em] h-[1.65em] w-[0.55em] shrink-0 rounded-[0.15em]"
          :style="{ backgroundColor: themeColor, transform: `skewX(${-slantDeg}deg)` }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 底带高度由内容撑开，仅保留左右边缘斜切 */
.slanted-bilingual-band {
  clip-path: polygon(0.8em 0, 100% 0, calc(100% - 0.8em) 100%, 0 100%);
}
</style>
