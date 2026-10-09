<script>
// 个人信息区域留白由组件声明，分页与渲染读取同一份尺寸，容器据此施加内边距。
const regionPadding = {
  top: 0, // 不额外增加顶部留白，沿用页面边距
  right: 0, // 水平留白沿用页面设置
  bottom: 0, // 不额外增加底部留白，沿用模块间距
  left: 0, // 水平留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { layoutStretchesColumns } from "@/views/resume/theme/layouts";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 学术个人信息外观：为居中的双线页眉铺一块浅色底托，正文分区从底托之下开始。
const {
  themeDecisions,
  ui,
  theme: { themeColor, themeColorSoft },
} = useResumePreviewContext();
// 底托宽度只在双栏布局铺满整栏，单栏下没有左右分区
const isTwoColumn = computed(() => layoutStretchesColumns(themeDecisions.value.layoutType));
const regionStyle = computed(() => ({
  "--academic-user-band": themeColorSoft.value, // 底托浅色面，主题色一成
  "--academic-user-accent": themeColor.value, // 左侧分区短竖条的主题色
  "--academic-user-surface": ui.value?.page?.background || "transparent", // 底托之下的纸张底色
}));
</script>

<template>
  <div
    class="academic-user relative w-full min-w-0 box-border"
    :class="{ 'academic-user--two-column': isTwoColumn }"
    :style="regionStyle"
  >
    <!-- 底托仅在双栏绘制，单栏个人信息恢复无背景的双线页眉。 -->
    <span
      aria-hidden="true"
      v-if="isTwoColumn"
      class="pointer-events-none absolute top-0 bottom-0 left-0 w-[30px]"
      :style="{ backgroundColor: 'var(--academic-user-band)' }"
    />
    <!-- 分区标记：短竖条与页眉双线共用左侧基准 -->
    <span
      aria-hidden="true"
      v-if="isTwoColumn"
      class="pointer-events-none absolute top-3 left-0 h-[18px] w-[2px]"
      :style="{ backgroundColor: 'var(--academic-user-accent)' }"
    />
    <!-- 移除个人信息区域底线，避免在正文标题上方重复绘制横线。 -->
    <slot />
  </div>
</template>

<style lang="scss" scoped>
/* 双栏布局下底托整栏铺开：个人信息与正文左右分区，单栏保持左侧窄条 */
.academic-user--two-column > span:first-of-type {
  width: 100%;
  background-color: color-mix(in srgb, var(--academic-user-accent) 8%, var(--academic-user-surface));
}
</style>
