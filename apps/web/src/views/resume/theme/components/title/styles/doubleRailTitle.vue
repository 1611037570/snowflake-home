<script setup>
import { computed, inject } from "vue";
import TitleText from "../titleText.vue";
import { resumeModuleKey } from "@/views/resume/editor/preview/shared/moduleContext";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题文字
});
const moduleKey = inject(resumeModuleKey);
const { bodyModuleKeys } = useResumePreviewContext();
// 序号按可见正文模块的当前顺序生成，移动或隐藏模块后自动更新。
const moduleNumber = computed(() =>
  String(bodyModuleKeys.value.indexOf(moduleKey?.value ?? "") + 1).padStart(2, "0"),
);
// 序号落在读数列，标题文字与条目正文同一条起始线。
const titleGridStyle = {
  gridTemplateColumns: "var(--timeline-rail-width) minmax(0, 1fr)", // 读数列与标题列
};
</script>

<template>
  <!-- 序号与日期同列右对齐，标题加宽字距，底线自轴线通到栏右端。 -->
  <div class="ink-title relative grid min-w-0 items-baseline pb-3" :style="titleGridStyle">
    <span class="ink-title__index">{{ moduleNumber }}</span>
    <h2 class="min-w-0 font-bold tracking-widest break-words">
      <TitleText :title="title" />
    </h2>
    <span aria-hidden="true" class="ink-title__rule" />
    <span aria-hidden="true" class="ink-title__node" />
  </div>
</template>

<style scoped>
/* 序号用等宽数字与强调色，右缘与日期读数列对齐。 */
.ink-title__index {
  padding-right: calc(18px + var(--ink-rail-gap));
  color: var(--ink-tick);
  font-size: 0.85em;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

/* 标题底线只绘图不占高度，起笔与轴线同位。 */
.ink-title__rule {
  position: absolute;
  right: 0;
  bottom: 0;
  left: calc(var(--timeline-rail-width) - 18px);
  height: 1px;
  background-color: var(--ink-axis);
  pointer-events: none;
}

/* 模块起点用实心方块标记，比条目横杠更重一级。 */
.ink-title__node {
  position: absolute;
  top: 0.5lh;
  left: calc(var(--timeline-rail-width) - 18px);
  width: 7px;
  height: 7px;
  background-color: var(--ink-tick);
  transform: translate(-50%, -50%);
  pointer-events: none;
}
</style>
