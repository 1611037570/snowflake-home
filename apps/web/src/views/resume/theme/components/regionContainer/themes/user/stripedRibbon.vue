<script>
import { defaultPaddingHorizontal } from "@/stores/modules/resume/config/uiConfig";

// 个人信息留白同时供页面渲染与分页高度计算读取：模板内边距换算后与这里的数值一致。
const regionPadding = {
  top: 36, // 纸张顶部与个人信息之间的留白，与模板 pt-9 一致
  right: 0, // 水平留白沿用页面设置
  bottom: 24, // 个人信息与正文之间的留白，与模板 pb-6 一致
  left: 0, // 水平留白沿用页面设置
};
export default { regionPadding };
</script>

<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  ui,
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
// 页面水平留白：右侧斜纹条按这份留白外移到纸张边缘，与标题飘带的终点对齐
const ribbonInset = computed(
  () =>
    `${Math.max(
      0,
      Number(ui.value?.page?.padding?.horizontal ?? defaultPaddingHorizontal) || 0,
    )}px`,
);
// 装饰变量集中声明，斜纹条不参与任何排版尺寸
const userStyle = computed(() => ({
  "--striped-user-accent": themeColor.value, // 粗斜纹使用的主题色
  "--striped-user-line": themeColorLine.value, // 细斜纹使用的主题色 40%
  "--striped-user-inset": ribbonInset.value, // 斜纹条距离内容右缘的距离
}));
</script>

<template>
  <!-- 个人信息区域：留白走模板 padding，右侧两道平行斜纹延续飘带标题的斜纹母题。 -->
  <div class="striped-ribbon-user relative box-border w-full min-w-0 pt-9 pb-6" :style="userStyle">
    <!-- 右缘粗斜纹：顶端贴住内容上沿，向下延伸出固定的斜纹长度 -->
    <span
      aria-hidden="true"
      class="striped-ribbon-user__ribbon pointer-events-none absolute top-3 right-[calc(-1*var(--striped-user-inset))] h-12 w-[3px]"
    />
    <!-- 右缘细斜纹：与粗斜纹同向错开，形成飘带标题里的两道平行斜纹 -->
    <span
      aria-hidden="true"
      class="striped-ribbon-user__ribbon-line pointer-events-none absolute top-6 right-[calc(-1*var(--striped-user-inset)+6px)] h-12 w-[3px]"
    />
    <slot />
  </div>
</template>

<style scoped>
/* 粗斜纹：底端向右收出斜角，与标题飘带的收尾方向一致。 */
.striped-ribbon-user__ribbon {
  background: linear-gradient(
    to bottom,
    var(--striped-user-accent) 0,
    var(--striped-user-accent) calc(100% - 6px),
    transparent calc(100% - 6px)
  );
  clip-path: polygon(0 0, 100% 0, 0 100%);
  opacity: 0.75;
  pointer-events: none;
}

/* 细斜纹：与粗斜纹反向收角，两条线之间留出一份斜纹间距。 */
.striped-ribbon-user__ribbon-line {
  background: linear-gradient(
    to bottom,
    var(--striped-user-line) 0,
    var(--striped-user-line) calc(100% - 6px),
    transparent calc(100% - 6px)
  );
  clip-path: polygon(100% 0, 0 0, 100% 100%);
  pointer-events: none;
}

/* 标题栏与个人信息之间的斜纹底：淡斜纹只落在个人信息下留白之上。 */
.striped-ribbon-user::after {
  content: "";
  position: absolute;
  right: calc(-1 * var(--striped-user-inset));
  bottom: 0;
  left: calc(-1 * var(--striped-user-inset));
  height: 12px;
  background-image: repeating-linear-gradient(
    135deg,
    color-mix(in srgb, var(--striped-user-accent) 10%, transparent) 0,
    color-mix(in srgb, var(--striped-user-accent) 10%, transparent) 2px,
    transparent 2px,
    transparent 8px
  );
  pointer-events: none;
}
</style>
