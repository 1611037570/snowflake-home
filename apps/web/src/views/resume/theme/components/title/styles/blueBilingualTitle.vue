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
  theme: { themeColor, themeColorContrast, themeColorSoft },
} = useResumePreviewContext();
// 双语标题始终优先展示中文，自定义中文标题保持用户原文。
const chineseTitle = computed(() =>
  /[\u3400-\u9FFF]/u.test(props.title)
    ? props.title
    : getPreviewTitle(props.moduleKey, "zh") || props.title,
);
// 已有模块取英文名称，自定义模块保留自身标题作为副标题。
const englishTitle = computed(() =>
  props.moduleKey === "education"
    ? "EDUCATION EXPERIENCE"
    : getPreviewTitle(props.moduleKey, "en") || props.title,
);
</script>

<template>
  <!-- 中文标题落在蓝色方块，英文标题并排显示于浅蓝横带。 -->
  <div class="flex min-w-0 items-stretch" :style="{ backgroundColor: themeColorSoft }">
    <h2
      class="flex min-h-[40px] max-w-[55%] shrink-0 items-center px-3 font-bold"
      :style="{ backgroundColor: themeColor, color: themeColorContrast }"
    >
      <TitleText :title="chineseTitle" />
    </h2>
    <span
      class="flex min-w-0 items-center px-3 text-base font-semibold tracking-wide text-white uppercase"
      >{{ englishTitle }}</span
    >
  </div>
</template>
