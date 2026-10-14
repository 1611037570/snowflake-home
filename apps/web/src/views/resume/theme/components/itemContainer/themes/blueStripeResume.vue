<script setup>
import { computed, inject } from "vue";
import { useItemBox } from "../useItemBox";
import { resumeModuleKey } from "@/views/resume/editor/preview/shared/moduleContext";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  blockRange: { // 当前分片块区间
    type: Object, // 块区间对象类型
    default: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }), // 缺省覆盖完整条目
  },
  contentRange: { // 当前分片正文区间
    type: Object, // 字符区间对象类型
    default: undefined, // 缺省读取完整正文
  },
  decoration: { // 当前分片装饰阶段
    type: String, // 阶段编号类型
    default: "full", // 缺省绘制完整条目
  },
  timeline: { // 公共时间轴状态
    type: Boolean, // 时间轴开关类型
    default: false, // 缺省不使用时间轴
  },
});
const moduleKey = inject(resumeModuleKey, computed(() => ""));
const hasGuideLine = computed(() => ["education", "work", "project"].includes(moduleKey.value));
const { theme: { themeColor } } = useResumePreviewContext();
const { fragmentStyle, boxStyle } = useItemBox(props, {
  radius: "0", // 条目保持直角
  paddingLeft: hasGuideLine.value ? "16px" : "0px", // 有引导线的条目为正文预留空间
});
</script>

<template>
  <!-- 经历条目用细蓝线引导，分片仍使用公共条目盒模型。 -->
  <div class="resume-item relative box-border" :class="{ 'resume-item--timeline': timeline }" :style="[boxStyle, fragmentStyle]">
    <span
      v-if="hasGuideLine"
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0 left-0 w-[2px]"
      :style="{ backgroundColor: themeColor }"
    />
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";
</style>
