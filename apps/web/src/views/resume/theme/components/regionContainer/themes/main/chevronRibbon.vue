<script>
// 正文留白由组件声明，分页和真实预览读取相同尺寸。
const regionPadding = {
  top: 12, // 首个模块标题与上方区域之间的留白
  right: 0, // 右侧留白沿用页面设置
  bottom: 12, // 正文末尾与页脚预留空间之间的留白
  left: 0, // 左侧留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { defaultPaddingHorizontal } from "@/stores/modules/resume/config/uiConfig";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColor },
} = useResumePreviewContext();
// 纸张左右留白：双栏时飘带按这份留白外移到纸张边缘，与标题长条的终点对齐
const paperBleed = computed(
  () => Math.max(0, Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0),
);
// 栏位是否铺满页高：铺满时栏位已到页脚预留空间之外，底色与飘带不再向下延伸
const stretchesColumns = computed(
  () => ui.value?.layout?.type === "twoColumn" || ui.value?.layout?.type === "topUserTwoColumn",
);
// 装饰变量集中声明，组件自身不改变内容宽度
const regionStyle = computed(() => ({
  "--chevron-region-accent": themeColor.value, // 箭头与飘带使用的主题色
  "--chevron-region-bleed": `${stretchesColumns.value ? 18 + paperBleed.value : 6}px`, // 飘带外移到纸张边缘的距离
  "--chevron-region-rail-height": stretchesColumns.value
    ? "48px"
    : "calc(100% - 12px)", // 单栏下飘带沿正文右缘铺满，底部让出一份区域留白
}));
</script>

<template>
  <!-- 正文区域只绘制装饰：留白通过组件声明的 regionPadding 表达，装饰全部绝对定位。 -->
  <div class="chevron-ribbon-main relative box-border w-full min-w-0 py-3" :style="regionStyle">
    <slot />
  </div>
</template>

<style scoped>
/* 正文右缘的细飘带：与条目右缘飘带落在同一条竖线上，箭头尖端朝右 */
.chevron-ribbon-main::before {
  content: "";
  position: absolute;
  top: 0;
  right: calc(-1 * var(--chevron-region-bleed));
  width: 3px;
  height: var(--chevron-region-rail-height);
  background: color-mix(in srgb, var(--chevron-region-accent) 42%, transparent);
  pointer-events: none;
}

/* 短箭头压在飘带顶端：与标题长条的箭尖方向保持一致 */
.chevron-ribbon-main::after {
  content: "";
  position: absolute;
  top: 0;
  right: calc(-1 * var(--chevron-region-bleed));
  width: 10px;
  height: 12px;
  background: var(--chevron-region-accent);
  clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 50%, calc(100% - 4px) 100%, 0 100%);
  pointer-events: none;
}
</style>
