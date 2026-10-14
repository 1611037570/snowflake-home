<script setup lang="ts">
import { computed, type PropType } from "vue";
import { EMPTY_THEME_INSET, type ThemeInset } from "@/domain/resume/theme/themeContract";
import { resolveRegionSlot } from "@/domain/resume/theme/regionSlots";
import { resolveRegionAppearance } from "./registry";
import { layoutStretchesColumns } from "@/domain/resume/theme/layouts";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  // 引擎下发的区域编号：slogan 承载标语，user 承载个人信息，main 承载正文
  regionId: {
    type: String,
    required: true,
  },
  // 引擎结算后的区域留白：包含页面上边距，未声明表示零留白
  regionPadding: {
    type: Object as PropType<ThemeInset>,
    default: undefined,
  },
  fullBleed: { type: Boolean, default: false }, // 当前区域是否实际占据纸张全宽
  topRegionPresent: { type: Boolean, default: false }, // 当前页是否由顶部通栏占位接管页面边距
  widthMode: { type: String, default: "content" }, // 区域使用纸张全宽或页面内容宽度
});
const { themeDecisions, ui } = useResumePreviewContext();
const slot = computed(() => resolveRegionSlot(props.regionId));
// 区域外观只按主题编号选择，具体样式由对应组件维护。
const appearance = computed(() => resolveRegionAppearance(ui.value?.theme?.template, slot.value));
// 区域外观与剩余空间共用同一个根容器：分页与渲染读同一份留白，布局注入量不会被漏掉
const padding = computed(() => props.regionPadding ?? EMPTY_THEME_INSET);
const regionStyle = computed(() => {
  const regionPadding = padding.value;
  // 页面水平内缩由公共盒子处理一次，测量和预览不再分别拼接外边距。
  const horizontal = Number(ui.value.page?.padding?.horizontal) || 0;
  const insetPage = props.topRegionPresent && !props.fullBleed && props.widthMode !== "page";
  // 通栏只延伸背景，内容左右内缩仍由公共页面设置控制。
  const pageInset = slot.value === "user" && props.fullBleed
    ? horizontal : 0;
  // 正文处于双栏布局时，底部追加栏内为页脚预留的空间
  const bottomSpace =
    slot.value === "main" && layoutStretchesColumns(themeDecisions.value.layoutType)
      ? "var(--resume-bottom-space, 0px)"
      : "0px";
  return {
    width: insetPage ? "auto" : undefined, // 页边距以内的区域占用剩余宽度
    marginLeft: insetPage ? `${horizontal}px` : undefined, // 公共页面左侧内缩
    marginRight: insetPage ? `${horizontal}px` : undefined, // 公共页面右侧内缩
    paddingTop: `${regionPadding.top}px`, // 区域顶部留白
    paddingRight: `${regionPadding.right + pageInset}px`, // 装饰内边距与通栏页面内缩
    paddingBottom: `calc(${regionPadding.bottom}px + ${bottomSpace})`, // 区域底部留白与栏内页尾空间
    paddingLeft: `${regionPadding.left + pageInset}px`, // 装饰内边距与通栏页面内缩
    "--resume-region-inset-top": `${regionPadding.top}px`, // 区域内部顶部定位基准
    "--resume-region-inset-left": `${regionPadding.left}px`, // 区域内部左侧定位基准
    "--resume-page-inset-horizontal": `${horizontal}px`, // 装饰延伸到纸张侧边的距离
    "--resume-page-inset-vertical": `${Number(ui.value.page?.padding?.vertical) || 0}px`, // 装饰延伸到纸张顶边的距离
  };
});
</script>

<template>
  <!-- 区域留白由容器按声明施加在外观组件根元素上，主题不再重复书写同值样式。 -->
  <component
    :is="appearance"
    :class="{ 'resume-view-container relative box-border flex w-full min-h-0 min-w-0 flex-1': slot === 'main' }"
    :style="regionStyle"
  >
    <slot />
  </component>
</template>

<style lang="scss" scoped></style>
