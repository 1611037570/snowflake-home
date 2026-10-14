<script setup>
import { computed, inject } from "vue";
import TitleText from "../titleText.vue";
import { resumeModuleKey } from "@/views/resume/editor/preview/shared/moduleContext";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
const moduleKey = inject(resumeModuleKey, computed(() => ""));
const { bodyModuleKeys, theme: { themeColor } } = useResumePreviewContext();
// 按当前模块顺序轮转撞色，首位避开页眉已经使用的黄色，移动模块后仍保持参考图的撞色节奏。
const moduleIndex = computed(() => bodyModuleKeys.value.indexOf(moduleKey.value));
const palette = computed(() => [themeColor.value, "#59BCB4", "#F7D65A"]);
const accentColor = computed(
  () => palette.value[Math.max(moduleIndex.value, 0) % palette.value.length],
);
// 黄色色条用深色文字，其余保持白色文字。
const titleColor = computed(() => accentColor.value === "#F7D65A" ? "#242424" : "#FFFFFF");
</script>

<template>
  <!-- 黑色错位背片与矩形色条随标题一起参与公共测量。 -->
  <div class="relative box-border min-w-0 pb-3">
    <span aria-hidden="true" class="absolute top-0 right-0 bottom-3 left-0 translate-x-[6px] translate-y-[6px] bg-[#242424]" />
    <h2
      class="relative box-border flex min-h-[54px] min-w-0 items-center px-6 py-3 font-black"
      :style="{ backgroundColor: accentColor, color: titleColor }"
    >
      <TitleText :title="title" />
    </h2>
  </div>
</template>
