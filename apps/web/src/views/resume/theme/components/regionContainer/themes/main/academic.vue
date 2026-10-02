<script>
import { defaultPaddingHorizontal, defaultPageRadius } from "@/stores/modules/resume/config/uiConfig";

// 正文区域留白由组件声明，模板类名与其换算结果保持一致，分页与渲染读取同一份尺寸。
const regionPadding = {
  top: 9, // 页眉分界线与板块内容之间的呼吸空间
  right: 0, // 左右留白沿用页面设置
  bottom: 0, // 底部留白沿用页面设置与页脚预留空间
  left: 0, // 左右留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 学术正文外观：居中双线页眉之下按分区排布，条目在自身外观里做引用式缩进。
const {
  ui,
  theme: { themeColor, themeColorLine, themeColorSoft },
} = useResumePreviewContext();
// 栏底色只在双栏布局绘制：单栏下没有左右分区，不必区分栏位
const isTwoColumn = computed(() =>
  ["twoColumn", "topUserTwoColumn"].includes(ui.value?.layout?.type),
);
const regionStyle = computed(() => ({
  "--academic-region-line": themeColorLine.value, // 页眉分界线的浅色描边
  "--academic-region-accent": themeColor.value, // 分区标题基准线的主题色
  "--academic-region-band": themeColorSoft.value, // 双栏底色，主题色一成的浅色面
  "--academic-column-bleed": `${Math.max(0, Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0)}px`, // 右栏底色延伸到纸张右边缘的距离
  "--academic-page-radius": `${Math.max(0, Number(ui.value?.page?.radius ?? defaultPageRadius) || 0)}px`, // 栏底色沿用纸张圆角
}));
</script>

<template>
  <div
    class="academic-main relative box-border flex w-full min-w-0 flex-1 flex-col pt-[9px]"
    :class="{ 'academic-main--two-column': isTwoColumn }"
    :style="regionStyle"
  >
    <!-- 页眉分界线：绝对定位绘制，不占据排版空间也就不会改变正文测量高度 -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute top-0 right-0 left-0 h-px"
      :style="{ backgroundColor: 'var(--academic-region-line)' }"
    />
    <!-- 分区标题基准线：线宽等于条目引用缩进加引线留白，与正文起始线对齐 -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute top-0 left-0 h-[2px] w-[36px]"
      :style="{ backgroundColor: 'var(--academic-region-accent)' }"
    />
    <slot />
  </div>
</template>

<style lang="scss" scoped>
/* 左栏底色截至页脚预留之外：底部只延伸到页脚上方留白，不覆盖页脚 */
.academic-main--two-column :deep(.resume-column) {
  box-sizing: border-box;
  position: relative;
  isolation: isolate;
  padding-left: 30px;
}

.academic-main--two-column :deep(.resume-column)::before {
  content: "";
  position: absolute;
  z-index: -1;
  top: 0;
  right: -12px;
  bottom: calc(-1 * var(--resume-bottom-space, 0px));
  left: 0;
  background-color: var(--academic-region-band);
  pointer-events: none;
}

/* 右栏底色压住栏间距并向右延伸到纸张边缘，底边同样停在页脚上方并沿用纸张右下圆角 */
.academic-main--two-column :deep(.resume-column + .resume-column)::before {
  right: calc(-1 * var(--academic-column-bleed, 0px));
  left: -12px;
  border-bottom-right-radius: var(--academic-page-radius);
  background-color: color-mix(in srgb, var(--academic-region-band) 55%, transparent);
}
</style>
