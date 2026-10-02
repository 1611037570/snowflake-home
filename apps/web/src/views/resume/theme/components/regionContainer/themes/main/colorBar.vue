<script>
// 正文留白由外观组件声明，分页与渲染读取同一份尺寸：左留白让出贯穿色条所在列。
const regionPadding = {
  top: 0, // 正文顶部不额外留白，色条紧接页眉色块下沿
  right: 0, // 正文右侧留白沿用页面设置
  bottom: 12, // 正文底部留白，色条收在内容下方
  left: 24, // 左侧让出贯穿色条与正文之间的间距
};
export default {
  regionPadding, // 分页与组件共用的正文留白
};
</script>

<script setup>
import { computed } from "vue";
import { layoutStretchesColumns } from "@/views/resume/theme/layouts";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColor },
} = useResumePreviewContext();
// 双栏版式栏位铺满纸张高度，色条要避开页脚预留空间才能贯通到底。
const stretchColumns = computed(() => layoutStretchesColumns(ui.value?.layout?.type));
// 色条颜色只取主题色，条目与标题按同一列左缩进对齐。
const railStyle = computed(() => ({
  "--color-bar-rail": themeColor.value, // 贯穿整页的色条颜色
}));
</script>

<template>
  <!-- 容器只声明留白不加内边距，色条用绝对定位绘制，不参与栏宽与分页测量。 -->
  <div
    class="color-bar-main relative box-border flex min-w-0"
    :class="{ 'color-bar-main--stretch': stretchColumns }"
    :style="railStyle"
  >
    <span aria-hidden="true" class="color-bar-main__rail pointer-events-none" />
    <slot />
  </div>
</template>

<style scoped>
/* 色条锚定正文栏左缘，高度随栏内高度贯通整页。 */
.color-bar-main__rail {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 6px;
  background-color: var(--color-bar-rail);
}

/* 双栏栏位铺满纸张时色条随之下探，底部避开页脚预留高度。 */
.color-bar-main--stretch .color-bar-main__rail {
  bottom: var(--resume-bottom-space, 0px);
}
</style>
