<script setup>
// 简历页面外壳：页面容器样式 + 页码页脚，多页渲染与缩略图单页共用
// 仅排版展示，不感知分页/测量逻辑；根元素回传供缩略图测量与导出使用
import { computed, useTemplateRef, watch } from "vue";
import { getPreviewText } from "../i18n";
import { PAGE_NUMBER_HEIGHT, RESUME_CONTAINER_HEIGHT, RESUME_CONTAINER_WIDTH } from "../constants";
import { useResumePreviewContext } from "../previewContext";

const props = defineProps({
  // 简历 ui（fontFamily / moduleSpacing）
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
  // 根元素回传回调（缩略图测量 / 图片导出需要）
  onEl: Function,
});

const rootEl = useTemplateRef("rootRef");
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
  const customBrand = props.ui.footer?.trim();
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
    class="resume-page-item relative flex flex-col rounded-3xl bg-white text-black"
    :class="[ui.fontFamily]"
    :style="[
      styles.paddingStyle,
      styles.fontStyle,
      styles.lineHeightStyle,
      RESUME_CONTAINER_WIDTH,
      RESUME_CONTAINER_HEIGHT,
      { paddingBottom: '0px' },
    ]"
  >
    <!-- 模块之间的间距由 ui.moduleSpacing 控制，与分页计算保持一致 -->
    <div class="flex flex-1 flex-col" :style="{ gap: `${ui.moduleSpacing}px` }">
      <slot />
    </div>
    <!-- 底部空间与页尾共用：只补足下边距超出页尾高度的部分 -->
    <div class="shrink-0" :style="{ height: bottomSpacerHeight }" />
    <!-- 页码区固定不伸缩：内容超高时只触发分页，不压缩页脚，保证页码位置恒定 -->
    <div
      v-if="showPageNumber"
      class="flex-c shrink-0 py-3 text-xs opacity-50"
      :style="{ height: `${PAGE_NUMBER_HEIGHT}px` }"
    >
      {{ footerText }}
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
