<script>
// 正文留白由区域组件声明，分页扣除的海拔与渲染出的内边距使用同一组数值。
// 引擎容器已按本声明在正文根元素上施加等值 padding，模板因此不再写任何留白类。
const regionPadding = {
  top: 36, // 正文顶部留白，供引擎在容器上施加
  right: 0, // 水平留白沿用页面设置
  bottom: 24, // 正文底部留白，承载底边的斜切底片
  left: 0, // 水平留白沿用页面设置
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
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColorSoft, themeColorLine },
} = useResumePreviewContext();
// 双栏布局的栏位延伸到纸张底部，装饰需要覆盖页脚之外的预留高度；单栏不补这一层。
const twoColumn = computed(
  () => ui.value?.layout?.type === "twoColumn" || ui.value?.layout?.type === "topUserTwoColumn",
);
// 纸张四周读数：底片向左下延伸到纸张边缘与底角，斜切因此落在整张纸的角上。
const regionStyle = computed(() => {
  const horizontal = Math.max(
    0,
    Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0,
  );
  const vertical = Math.max(
    0,
    Number(ui.value?.page?.padding?.vertical ?? defaultPaddingVertical) || 0,
  );
  const radius = Math.max(0, Number(ui.value?.page?.radius ?? defaultPageRadius) || 0);
  return {
    "--slanted-region-plate": themeColorSoft.value, // 底边斜切底片：主题色 10%
    "--slanted-region-edge": themeColorLine.value, // 底片斜边上的细线：主题色 40%
    "--slanted-region-bleed": `${horizontal}px`, // 底片向纸张左右边缘延伸的距离
    "--slanted-region-bottom-bleed": `${vertical}px`, // 底片向纸张下边缘延伸的距离
    "--slanted-region-radius": `${radius}px`, // 底片沿用纸张左下圆角
    "--slanted-region-cut": `${regionPadding.bottom}px`, // 底片左下斜切的高度，与正文底部留白同值
    "--slanted-region-band": `${regionPadding.bottom}px`, // 底片自身高度，斜切因此完整落在正文下留白内
    "--slanted-region-line": "0.8px", // 斜边细线的竖直厚度，换算后恰好贴着底片斜边
    "--slanted-region-rail": "140px", // 双栏右侧装饰线自底片上沿向上延伸的长度
  };
});
</script>

<template>
  <!-- 正文外观只绘制装饰图层：留白由区域容器按 regionPadding 施加，装饰全部绝对定位。 -->
  <div class="slanted-region-main relative isolate box-border min-w-0" :style="regionStyle">
    <!-- 底边斜切底片：覆盖正文下留白与栏内页尾空间，左下切出斜角。 -->
    <!-- 下沿按纸张下留白外扩，斜切因此贴到纸张下边缘。 -->
    <span
      aria-hidden="true"
      class="slanted-region-main__band pointer-events-none absolute -z-10"
      :style="{
        right: 'calc(-1 * var(--slanted-region-bleed))',
        bottom: 'calc(-1 * var(--slanted-region-bottom-bleed))',
        left: 'calc(-1 * var(--slanted-region-bleed))',
        height: 'calc(var(--slanted-region-band) + var(--slanted-region-bottom-bleed))',
      }"
    />
    <!-- 斜切边线：整块底片只露出斜边上方一条细线，用主题色收住斜切走向。 -->
    <span
      aria-hidden="true"
      class="slanted-region-main__edge pointer-events-none absolute -z-10"
      :style="{
        right: 'calc(-1 * var(--slanted-region-bleed))',
        bottom: 'calc(-1 * var(--slanted-region-bottom-bleed))',
        left: 'calc(-1 * var(--slanted-region-bleed))',
        height: 'calc(var(--slanted-region-band) + var(--slanted-region-bottom-bleed))',
      }"
    />
    <!-- 双栏时沿纸张右缘向上补一段装饰线：单栏不绘制，避免在错误位置留痕。 -->
    <span
      v-if="twoColumn"
      aria-hidden="true"
      class="slanted-region-main__rail pointer-events-none absolute -z-10"
      :style="{
        top: 'calc(-1 * var(--slanted-region-band))',
        right: 'calc(-1 * var(--slanted-region-bleed))',
        height: 'var(--slanted-region-rail)',
      }"
    />
    <slot />
  </div>
</template>

<style scoped>
/* 斜切底片：左下抬起一段高度，右下贴齐，与标题背片共用同一种斜角。 */
.slanted-region-main__band {
  border-bottom-left-radius: var(--slanted-region-radius);
  background-color: var(--slanted-region-plate);
  clip-path: polygon(0 var(--slanted-region-cut), 100% 0, 100% 100%, 0 100%);
}

/* 斜切边线：把整块底片裁成斜边上方的一条细线，颜色只落在斜边上。 */
.slanted-region-main__edge {
  background-color: var(--slanted-region-edge);
  clip-path: polygon(
    0 var(--slanted-region-cut),
    100% 0,
    100% calc(100% - var(--slanted-region-cut) + var(--slanted-region-line) * 1.414),
    0 calc(100% + var(--slanted-region-line) * 1.414)
  );
}

/* 双栏装饰线：沿纸张右缘向上收住整栏，与底片斜角同色，单栏不渲染。 */
.slanted-region-main__rail {
  border-left: 1px solid var(--slanted-region-edge);
}
</style>
