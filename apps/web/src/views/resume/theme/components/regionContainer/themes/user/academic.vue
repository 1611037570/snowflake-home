<script>
// 个人信息区域留白由组件声明，模板类名与其换算结果保持一致，分页与渲染读取同一份尺寸。
const regionPadding = {
  top: 12, // 纸张顶边与个人信息之间的呼吸空间
  right: 0, // 水平留白沿用页面设置
  bottom: 24, // 个人信息与正文区域之间的分区留白
  left: 0, // 水平留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 学术个人信息外观：为居中的双线页眉铺一块浅色底托，正文分区从底托之下开始。
const {
  ui,
  theme: { themeColor, themeColorSoft },
} = useResumePreviewContext();
// 底托宽度只在双栏布局铺满整栏，单栏下没有左右分区
const isTwoColumn = computed(() =>
  ["twoColumn", "topUserTwoColumn"].includes(ui.value?.layout?.type),
);
const regionStyle = computed(() => ({
  "--academic-user-band": themeColorSoft.value, // 底托浅色面，主题色一成
  "--academic-user-accent": themeColor.value, // 左侧分区短竖条的主题色
  "--academic-user-surface": ui.value?.page?.background || "transparent", // 底托之下的纸张底色
}));
</script>

<template>
  <div
    class="academic-user relative w-full min-w-0 box-border pt-3 pb-6"
    :class="{ 'academic-user--two-column': isTwoColumn }"
    :style="regionStyle"
  >
    <!-- 底托：绝对定位绘制，留白仍全部由 padding 表达 -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute top-0 bottom-0 left-0 w-[30px]"
      :style="{ backgroundColor: 'var(--academic-user-band)' }"
    />
    <!-- 分区标记：短竖条与页眉双线共用左侧基准 -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute top-3 left-0 h-[18px] w-[2px]"
      :style="{ backgroundColor: 'var(--academic-user-accent)' }"
    />
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
