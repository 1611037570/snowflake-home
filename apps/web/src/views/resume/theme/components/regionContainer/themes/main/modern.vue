<script>
// 正文留白由外观组件声明，分页测量与实际预览共用同一份尺寸。
const regionPadding = {
  top: 12, // 正文顶部留白：标题上沿与区域上沿之间留出细条起笔的空间
  right: 0, // 右侧留白沿用页面设置
  bottom: 0, // 底部留白沿用页面设置
  left: 30, // 左侧为细条与条目缩进让出的宽度，与条目 paddingLeft 取同一数值
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { themeColor, themeColorSoft, themeColorLine },
} = useResumePreviewContext();
// 左侧细条贯穿正文区域：只提供颜色变量，几何形状交给样式表，不占用内容宽度。
const railStyle = computed(() => ({
  "--modern-rail": themeColor.value, // 左侧细条的主题色
  "--modern-rail-soft": themeColorSoft.value, // 模块标题底衬等浅色装饰
  "--modern-rail-line": themeColorLine.value, // 模块之间的分隔线
}));
</script>

<template>
  <!-- 留白由区域容器统一下发，外观只绘制左侧细条与模块分隔线，不挤压内容宽度 -->
  <div class="modern-main relative box-border min-w-0" :style="railStyle">
    <slot />
  </div>
</template>

<style scoped>
/* 细条贴着区域内容左沿绘制：竖向跟随区域高度，不参与内容排布 */
.modern-main::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background-color: var(--modern-rail);
  pointer-events: none;
}

/* 模块之间用细线分隔，线贴在标题上沿，不产生额外留白 */
.modern-main :deep(.resume-column > .resume-module-wrapper:not(:first-of-type)) {
  border-top: 1px solid var(--modern-rail-line);
}
</style>
