<script setup>
// 简历页面外壳：页面容器样式 + 页码页脚，多页渲染与缩略图单页共用
// 仅排版展示，不感知分页/测量逻辑；根元素回传供缩略图测量与导出使用
import { computed, useTemplateRef, watch } from "vue";
import { getPreviewText } from "../shared/i18n";
import {
  PAGE_NUMBER_HEIGHT,
  RESUME_CONTAINER_HEIGHT,
  RESUME_CONTAINER_WIDTH,
} from "../shared/constants";
import { useResumePreviewContext } from "../shared/previewContext";
import { useResumeStore } from "@/stores";
import {
  defaultPageBackground,
  defaultPageBorderColor,
  defaultPageRadius,
} from "@/stores/modules/resume/config/uiConfig";
import PagePattern from "@/views/resume/theme/components/pageContainer/index.vue";

const props = defineProps({
  // 简历 ui（font.family / page.spacing.module）
  ui: {
    type: Object,
    default: () => ({}),
  },
  // 主题样式对象：{ paddingStyle, fontStyle, lineHeightStyle }
  styles: {
    type: Object,
    required: true,
  },
  // 是否渲染页码区
  showPageNumber: {
    type: Boolean,
    default: false,
  },
  // 当前页码（页脚文案）
  pageIndex: {
    type: Number,
    default: 0,
  },
  // 总页数（页脚文案）
  pageCount: {
    type: Number,
    default: 1,
  },
  // 当前页面顶部是否有独立通栏区域，该区域从纸张顶端开始排版
  hasTopRegion: {
    type: Boolean,
    default: false,
  },
  // 根元素回传回调（缩略图测量 / 图片导出需要）
  onEl: Function,
});

const rootEl = useTemplateRef("rootRef");
// 调试开关：开启后标注正文可用区，方便排查分页与边距
const { system } = storeToRefs(useResumeStore());
const showDebug = computed(() => !!system.value.showDebug);
// 双栏内容区域铺满纸张高度，页脚覆盖在栏内预留的底部空间上。
const fullHeightColumns = computed(() =>
  props.ui.layout?.type === "twoColumn" || props.ui.layout?.type === "topUserTwoColumn",
);
const bottomSpace = computed(() =>
  Math.max(parseFloat(props.styles.paddingStyle.paddingBottom) || 0, props.showPageNumber ? PAGE_NUMBER_HEIGHT : 0),
);
const pageBackground = computed(() => props.ui.page?.background || defaultPageBackground);
const pageTextColor = computed(() =>
  pageBackground.value.toLowerCase() === "#000000" ? "#ffffff" : "#000000",
);
// 预览整体带 scale 缩放，线宽会被一起缩小，按足够醒目的宽度标注
const debugOutlineStyle = { outline: "4px dashed var(--sf-error)", outlineOffset: "-1px" };
// 纸张外观：圆角与边框都来自主题配置，边框画在页面盒子内圈并参与内容宽高
const pageSurfaceStyle = computed(() => ({
  borderRadius: `${Number(props.ui.page?.radius ?? defaultPageRadius)}px`,
  borderWidth: `${Math.max(0, Number(props.ui.page?.border?.width) || 0)}px`,
  borderStyle: "solid",
  borderColor: props.ui.page?.border?.color || defaultPageBorderColor,
  "--resume-bottom-space": `${bottomSpace.value}px`, // 双栏内部为页脚和页面下留白预留的高度
}));
// 底部空间由页尾与下边距共用：页尾更高时不再叠加下边距，下边距更大时只补足超出的部分
const bottomSpacerHeight = computed(() => {
  const paddingBottom = parseFloat(props.styles.paddingStyle.paddingBottom) || 0;
  const footerHeight = props.showPageNumber ? PAGE_NUMBER_HEIGHT : 0;
  return `${Math.max(0, paddingBottom - footerHeight)}px`;
});
// 简历展示语言：与模块标题语言包保持一致
const { lang: previewLang } = useResumePreviewContext();
const footerText = computed(() => {
  const defaultFooter = getPreviewText("footer", previewLang.value, {
    page: props.pageIndex + 1,
    total: props.pageCount,
  });
  // 仅品牌名可自定义：用自定义文案替换默认品牌名，页码后缀保持默认格式
  const customBrand = props.ui.page?.footer?.trim();
  if (!customBrand) return defaultFooter;
  return defaultFooter.replace(getPreviewText("brand", previewLang.value), customBrand);
});
// ref 就绪或变化后回传根元素
watch(
  rootEl,
  (el) => {
    props.onEl?.(el || null);
  },
  { immediate: true },
);
</script>

<template>
  <div
    ref="rootRef"
    class="resume-page-item relative isolate flex flex-col"
    :class="[ui.font?.family]"
    :style="[
      styles.paddingStyle,
      styles.fontStyle,
      styles.lineHeightStyle,
      pageSurfaceStyle,
      {
        backgroundColor: pageBackground,
        color: pageTextColor,
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      },
      RESUME_CONTAINER_WIDTH,
      RESUME_CONTAINER_HEIGHT,
      hasTopRegion ? { paddingTop: '0px', paddingLeft: '0px', paddingRight: '0px' } : undefined,
      { paddingBottom: '0px' },
    ]"
  >
    <!-- 背景纹理由页面纹理组件绘制，与长图导出共用同一份实现 -->
    <PagePattern />
    <!-- 模块之间的间距由 ui.page.spacing.module 控制，与分页计算保持一致 -->
    <!-- 调试模式下用 outline 标注正文可用区：outline 不参与布局，不会挤压内容，内容溢出时也会显示出来 -->
    <div
      class="flex flex-1 flex-col"
      :style="[{ gap: `${ui.page?.spacing?.module}px` }, showDebug ? debugOutlineStyle : undefined]"
    >
      <slot />
    </div>
    <!-- 底部空间与页尾共用：只补足下边距超出页尾高度的部分 -->
    <div v-if="!fullHeightColumns" class="shrink-0" :style="{ height: bottomSpacerHeight }" />
    <!-- 页码区固定不伸缩：内容超高时只触发分页，不压缩页脚，保证页码位置恒定 -->
    <div
      v-if="showPageNumber"
      class="flex-c shrink-0 py-3 text-xs opacity-50"
      :class="{ 'absolute inset-x-0 bottom-0': fullHeightColumns }"
      :style="{ height: `${PAGE_NUMBER_HEIGHT}px` }"
    >
      {{ footerText }}
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
