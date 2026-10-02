<script>
// 正文留白由外观组件声明：分页扣除的高度与模板渲染出的尺寸读取同一份数值。
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
import {
  defaultPaddingHorizontal,
  defaultPaddingVertical,
  defaultPageRadius,
} from "@/stores/modules/resume/config/uiConfig";
import { layoutStretchesColumns } from "@/views/resume/theme/layouts";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
// 纸张左右留白：斜纹条按这份留白外移到纸张边缘，与模块标题斜纹的终点对齐
const paperBleed = computed(
  () => Math.max(0, Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0),
);
// 纸张上下留白与圆角：双栏底色铺到纸张边缘时沿用同一份读数
const paperVertical = computed(
  () => Math.max(0, Number(ui.value?.page?.padding?.vertical ?? defaultPaddingVertical) || 0),
);
const paperRadius = computed(
  () => Math.max(0, Number(ui.value?.page?.radius ?? defaultPageRadius) || 0),
);
// 栏位是否铺满页高：仅双栏布局绘制栏底色，单栏下不绘制
const stretchesColumns = computed(() => layoutStretchesColumns(ui.value?.layout?.type));
// 装饰变量集中声明，组件自身不改变内容宽度与高度
const regionStyle = computed(() => ({
  "--striped-region-accent": themeColor.value, // 右缘斜纹条使用的主题色
  "--striped-region-line": themeColorLine.value, // 双栏分割线使用的主题色 40%
  "--striped-region-bleed": `${stretchesColumns.value ? 18 + paperBleed.value : 6}px`, // 斜纹条外移到纸张边缘的距离
  "--striped-region-bottom-bleed": `${paperVertical.value}px`, // 双栏底色向纸张下边缘延伸的距离
  "--striped-region-radius": `${paperRadius.value}px`, // 双栏底色沿用纸张左下圆角
}));
</script>

<template>
  <!-- 正文区域只绘制装饰：留白由引擎按 regionPadding 施加，装饰全部绝对定位。 -->
  <div class="striped-ribbon-main relative box-border isolate w-full min-w-0" :style="regionStyle">
    <!-- 双栏底色：向左铺到纸张边缘并向下延伸到页脚预留之外，单栏下不绘制。 -->
    <span
      v-if="stretchesColumns"
      aria-hidden="true"
      class="striped-ribbon-main__surface pointer-events-none absolute"
    />
    <!-- 右缘斜纹条：延续飘带标题的两道平行斜纹，底端向右收出斜角。 -->
    <span
      aria-hidden="true"
      class="striped-ribbon-main__ribbon pointer-events-none absolute top-3 right-[calc(-1*var(--striped-region-bleed))] h-12 w-[3px]"
    />
    <!-- 斜纹条内侧的细线：与斜纹条同向，形成粗细两道平行斜纹。 -->
    <span
      aria-hidden="true"
      class="striped-ribbon-main__ribbon-line pointer-events-none absolute top-9 right-[calc(-1*var(--striped-region-bleed))] h-12 w-[3px]"
    />
    <slot />
  </div>
</template>

<style scoped>
/* 右缘斜纹条：贴住正文右缘，与条目标题的细斜纹落在同一套语言里。 */
.striped-ribbon-main__ribbon {
  background: linear-gradient(
    to bottom,
    var(--striped-region-accent) 0,
    var(--striped-region-accent) calc(100% - 6px),
    transparent calc(100% - 6px)
  );
  clip-path: polygon(0 0, 100% 0, 0 100%);
  opacity: 0.75;
  pointer-events: none;
}

/* 斜纹条内侧细线：与粗斜纹错开一段，形成飘带标题里的第二道斜纹。 */
.striped-ribbon-main__ribbon-line {
  opacity: 0.35;
  background: linear-gradient(
    to bottom,
    var(--striped-region-line) 0,
    var(--striped-region-line) calc(100% - 6px),
    transparent calc(100% - 6px)
  );
  clip-path: polygon(100% 0, 0 0, 100% 100%);
}

/* 双栏底色：栏位铺满页高时向左下延伸到纸张边缘，圆角沿用纸张左下角。 */
.striped-ribbon-main__surface {
  top: -12px;
  right: calc(-1 * var(--striped-region-bleed));
  bottom: calc(-1 * var(--striped-region-bottom-bleed) - 12px);
  left: calc(-1 * var(--striped-region-bleed));
  border-bottom-left-radius: var(--striped-region-radius);
  background-color: color-mix(in srgb, var(--striped-region-accent) 6%, transparent);
  pointer-events: none;
}
</style>
