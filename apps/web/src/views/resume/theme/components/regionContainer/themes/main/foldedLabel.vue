<script>
// 正文留白由组件声明，分页与真实预览读取相同尺寸；留白由引擎施加，组件不再写留白类。
const regionPadding = {
  top: 12, // 正文顶部留白，左上折角绘制在这段留白里
  right: 0, // 右侧留白沿用页面设置
  bottom: 12, // 正文底部留白，与条目留白一致
  left: 0, // 左侧留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 折角正文区域：左上角折出暗面折片与折起亮面，把标题与条目的折角语言延续到区域层。
const {
  theme: { themeColor, themeColorSoft, themeColorLine, themeColorContrast },
} = useResumePreviewContext();

// 折角边长与区域上留白共用同一个值：折片正好落在条目起始线之上，不挤占正文。
const FOLD_SIZE = regionPadding.top;
// 区域折角的装饰变量集中声明，组件自身不改变内容宽度与分页尺寸。
const regionStyle = computed(() => ({
  "--folded-region-fold": `${FOLD_SIZE}px`, // 折角边长
  "--folded-region-accent": themeColor.value, // 折痕与折片的主题色
  "--folded-region-lift": themeColorContrast.value, // 折起亮面，与色块上的文字同色
  "--folded-region-edge": themeColorLine.value, // 区域顶端细线
  "--folded-region-plate": themeColorSoft.value, // 折起一侧的浅色底
}));
</script>

<template>
  <!-- 装饰全部绝对定位并留在区域留白之内：不写任何留白类，分页尺寸与排版不变。 -->
  <div class="folded-region-main relative isolate box-border min-w-0" :style="regionStyle">
    <!-- 区域顶端细线：把正文上沿用主题色收住，与折角连成一条折页边。 -->
    <span
      aria-hidden="true"
      class="folded-region-main__edge pointer-events-none absolute top-0 right-0 left-0 h-px -z-10"
    />
    <!-- 左上折角折片：以对角线切出三角形，暗面收住区域的左上角。 -->
    <span
      aria-hidden="true"
      class="folded-region-main__shade pointer-events-none absolute top-0 left-0 -z-10"
    />
    <!-- 左上折角折起：折片翻出的亮面，边缘用主题线条色压出折痕。 -->
    <span
      aria-hidden="true"
      class="folded-region-main__lift pointer-events-none absolute top-0 left-0 -z-10"
    />
    <slot />
  </div>
</template>

<style scoped>
/* 顶端细线：只占 1px，压在正文上留白之内，不参与测量。 */
.folded-region-main__edge {
  background-color: var(--folded-region-edge);
}

/* 折片：左上角切出向右下收的折角暗面。 */
.folded-region-main__shade {
  width: var(--folded-region-fold);
  height: var(--folded-region-fold);
  background-color: color-mix(in srgb, var(--folded-region-accent) 62%, black 38%);
  clip-path: polygon(0 0, 100% 0, 0 100%);
}

/* 折起：折片下方的亮面，与暗面对角互补，拼成完整的折角。 */
.folded-region-main__lift {
  width: var(--folded-region-fold);
  height: var(--folded-region-fold);
  background-color: var(--folded-region-lift);
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
  box-shadow: inset 1px -1px 0 0 var(--folded-region-plate);
}
</style>
