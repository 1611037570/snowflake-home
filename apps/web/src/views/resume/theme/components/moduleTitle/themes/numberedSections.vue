<script setup>
import { computed, inject } from "vue";
import TitleText from "../titleText.vue";
import { resumeModuleKey } from "@/views/resume/editor/preview/shared/moduleContext";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  /** 模块标题文字 */
  title: {
    /** 标题值类型 */
    type: String,
    /** 未传入标题时的默认文字 */
    default: "",
  },
});
const moduleKey = inject(resumeModuleKey);
const {
  bodyModuleKeys,
  theme: { themeColor },
} = useResumePreviewContext();
// 序号按可见正文模块的当前顺序生成，移动或隐藏模块后自动更新。
const moduleNumber = computed(() =>
  String(bodyModuleKeys.value.indexOf(moduleKey?.value ?? "") + 1).padStart(2, "0"),
);
</script>

<template>
  <!-- 大号两位序号与模块标题沿垂直中心线对齐。 -->
  <div class="flex items-center gap-3">
    <span class="shrink-0 text-[2em] leading-none font-bold" :style="{ color: themeColor }">{{
      moduleNumber
    }}</span>
    <h2 class="max-w-full min-w-0 font-bold tracking-wide">
      <TitleText :title="title" />
    </h2>
  </div>
</template>
