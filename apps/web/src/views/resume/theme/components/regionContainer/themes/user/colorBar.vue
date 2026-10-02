<script>
// 页眉留白由组件与分页共用，模板类的换算结果与这里同值。
const regionPadding = {
  top: 36, // 色块顶部与个人信息之间的留白
  right: 0, // 右侧留白由页面设置提供，模板按同值展开
  bottom: 24, // 色块底部与正文区域之间的内部留白
  left: 0, // 左侧留白由页面设置提供，模板按同值展开
};
export default {
  regionPadding, // 个人信息区域内部留白
  fillsPageTop: true, // 首屏色块页眉从纸张顶边铺满整宽
};
</script>

<script setup>
import { computed } from "vue";
import {
  defaultPaddingHorizontal,
  defaultPageRadius,
} from "@/stores/modules/resume/config/uiConfig";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColor, themeColorContrast },
} = useResumePreviewContext();
// 色块铺满纸张整宽：横向留白与页面设置同值，栏宽仍与分页扣除的留白一致。
const bandStyle = computed(() => {
  const horizontal = Math.max(
    0,
    Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0,
  );
  const radius = Math.max(0, Number(ui.value?.page?.radius ?? defaultPageRadius) || 0);
  return {
    paddingLeft: `${horizontal}px`, // 与页面左留白同值
    paddingRight: `${horizontal}px`, // 与页面右留白同值
    backgroundColor: themeColor.value, // 首屏色块底色
    color: themeColorContrast.value, // 色块上的文字与图标颜色
    borderTopLeftRadius: `${radius}px`, // 沿用纸张圆角
    borderTopRightRadius: `${radius}px`, // 沿用纸张圆角
  };
});
// 区域与正文区域之间的间距由布局给出，色条按同值向下补齐这段断口。
const bridgeGap = computed(() => Math.max(0, Number(ui.value?.page?.spacing?.module) || 0));
const bridgeStyle = computed(() => {
  const horizontal = Math.max(
    0,
    Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0,
  );
  return {
    left: `${horizontal}px`, // 与正文区域色条同列
    bottom: `${-bridgeGap.value}px`, // 从色块下沿继续向下
    height: `${bridgeGap.value}px`, // 补齐区域间距
    backgroundColor: themeColor.value, // 与色块同色
  };
});
</script>

<template>
  <!-- 色块页眉：模板留白与 regionPadding 等值，装饰全部用绝对定位绘制。 -->
  <div class="color-bar-user relative box-border flex w-full min-w-0 pt-9 pb-6" :style="bandStyle">
    <span
      v-if="bridgeGap > 0"
      aria-hidden="true"
      class="color-bar-user__bridge pointer-events-none"
      :style="bridgeStyle"
    />
    <slot />
  </div>
</template>

<style scoped>
/* 色条截面与正文区域色条同宽同色，衔接页眉与正文。 */
.color-bar-user__bridge {
  position: absolute;
  width: 6px;
}
</style>
