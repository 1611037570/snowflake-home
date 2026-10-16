<script setup>
// 简历页面外壳：页面容器样式 + 页码页脚，多页渲染与缩略图单页共用
// 仅排版展示，不感知分页/测量逻辑；根元素回传供缩略图测量与导出使用
import { computed, useTemplateRef, watch } from "vue";
import { getResumeFooterText } from "../shared/footerTemplates";
import {
  PAGE_NUMBER_HEIGHT,
  RESUME_CONTAINER_HEIGHT,
  RESUME_CONTAINER_WIDTH,
} from "../shared/constants";
import { useResumePreviewContext } from "../shared/previewContext";
import {
  defaultPageBackground,
  defaultFooter,
  defaultFooterTemplate,
} from "@/domain/resume/theme/uiConfig";
import PagePattern from "@/views/resume/theme/components/pageContainer/index.vue";
import PageFooter from "@/views/resume/theme/components/pageFooter/index.vue";
import { layoutStretchesColumns } from "@/domain/resume/theme/layouts";
import { resolveThemePageAppearance } from "@/views/resume/theme";

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
  // 是否展示正文辅助线，由编辑区统一的调试条件控制
  showDebug: {
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

// 页面固定外观独立读取当前主题决策。
const { themeDecisions } = useResumePreviewContext();
const rootEl = useTemplateRef("rootRef");
// 双栏内容区域铺满纸张高度，页脚覆盖在栏内预留的底部空间上。
const fullHeightColumns = computed(() => layoutStretchesColumns(themeDecisions.value.layoutType));
const bottomSpace = computed(() =>
  Math.max(parseFloat(props.styles.paddingStyle.paddingBottom) || 0, props.showPageNumber ? PAGE_NUMBER_HEIGHT : 0),
);
const pageBackground = computed(() => props.ui.page?.background || defaultPageBackground);
// 正文颜色统一读取当前界面配置，未声明时保持默认黑色。
const pageTextColor = computed(() => props.ui.font?.color || "#000");
// 页面级外观由主题声明，公共页面只读取声明，不再判断主题编号
const themePageAppearance = computed(() => resolveThemePageAppearance(props.ui.theme?.template));
// 顶部铺边：续页一律让栏底色盖住纸张顶部留白，首页只对声明了铺边的主题生效
const bleedsPageTop = computed(
  () => (props.pageIndex > 0 || themePageAppearance.value.bleedsPageTop === true) && !props.hasTopRegion,
);
// 纸张统一使用直角，主题边框画在页面盒子内圈并参与内容宽高
const pageSurfaceStyle = computed(() => ({
  borderRadius: "0px", // 预览纸张固定为直角
  borderWidth: `${Math.max(0, Number(themeDecisions.value.pageBorder.width) || 0)}px`,
  borderStyle: "solid",
  borderColor: themeDecisions.value.pageBorder.color,
  "--resume-bottom-space": `${bottomSpace.value}px`, // 双栏内部为页脚和页面下留白预留的高度
  "--resume-page-top-space": bleedsPageTop.value ? props.styles.paddingStyle.paddingTop : "0px", // 栏底色覆盖纸张顶部留白
}));
// 底部空间由页尾与下边距共用：页尾更高时不再叠加下边距，下边距更大时只补足超出的部分
const bottomSpacerHeight = computed(() => {
  const paddingBottom = parseFloat(props.styles.paddingStyle.paddingBottom) || 0;
  const footerHeight = props.showPageNumber ? PAGE_NUMBER_HEIGHT : 0;
  return `${Math.max(0, paddingBottom - footerHeight)}px`;
});
// 简历展示语言：与模块标题语言包保持一致
const { lang: previewLang } = useResumePreviewContext();
// 页尾品牌留空时只展示所选样式的页码。
const footerText = computed(() => getResumeFooterText(
  props.ui.page?.footer ?? defaultFooter,
  props.ui.page?.footerTemplate ?? defaultFooterTemplate,
  props.pageIndex + 1,
  props.pageCount,
  previewLang.value,
));
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
  <!-- 页码标记用于限制主题装饰只在首页显示。 -->
  <div
    ref="rootRef"
    :data-page-index="pageIndex"
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
    <!-- 内容区允许收缩到剩余高度，正文不会通过最小高度推开页脚。 -->
    <div
      class="flex min-h-0 flex-1 flex-col"
      :class="{ 'resume-debug-content-outline': showDebug }"
      :style="{ gap: `${ui.page?.spacing?.module}px` }"
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
      <PageFooter :text="footerText" :template-id="props.ui.page?.footerTemplate ?? defaultFooterTemplate" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 辅助线使用独立类，导出统一移除，不影响主题外观与内容尺寸。 */
.resume-debug-content-outline {
  outline: 4px dashed var(--sf-error);
  outline-offset: -1px;
}
</style>
