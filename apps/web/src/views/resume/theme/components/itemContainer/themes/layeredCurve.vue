<script>
// 层叠弧线条目不使用左侧日期栏，日期仍跟随正文头部的日期位置设置。
const usesDateRail = false;
export default { usesDateRail };
</script>

<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 层叠弧线条目外观：条目落在浅色底片上，下层底片沿弧角向右下错位露出，
// 右下角收一条弧角细线，延续标题的层叠弧角语言。
// 分片圆角与续段收边由共享盒模型计算，外观只声明留白与配色。
const props = defineProps({
  // 分片覆盖的块区间：续段不画上圆角、不补上内边距
  blockRange: {
    type: Object,
    default: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }),
  },
  // 分片覆盖的正文区间
  contentRange: {
    type: Object,
    default: undefined,
  },
  // 分片装饰类型
  decoration: {
    type: String,
    default: "full",
  },
  // 时间轴条目预留固定日期栏，本主题不使用日期栏
  timeline: {
    type: Boolean,
    default: false,
  },
});

/** 条目圆角：由外观自己声明，分片内外侧由共享规则裁剪 */
const ITEM_RADIUS = "12px";
/** 条目四周留白：底片错位与弧角细线都画在留白之外，不额外占高 */
const ITEM_PADDING = "12px";
/** 下层底片向右下错位的距离：与标题三层弧线的错位方向保持一致 */
const PLATE_OFFSET = "8px";
/** 底边弧角细线的高度：只落在条目下留白内，不挤压正文 */
const EDGE_HEIGHT = "2px";

const {
  theme: { themeColorSoft, themeColorLine },
} = useResumePreviewContext();

// 盒模型、分片收边与日期栏统一由共享钩子计算，渲染与测量得到同一份尺寸。
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: ITEM_RADIUS,
  padding: ITEM_PADDING,
  paddingLeft: ITEM_PADDING,
  backgroundColor: "transparent",
  borderColor: "transparent",
});

// 装饰数值与配色集中在样式变量里，颜色只取主题色派生值。
const itemStyle = computed(() => ({
  "--layered-item-plate": themeColorSoft.value, // 上层底片：主题色 10% 浅底
  "--layered-item-line": themeColorLine.value, // 下层底片描边与右下角弧线：主题色 40%
  "--layered-item-offset": PLATE_OFFSET, // 下层底片向右下错位的距离
  "--layered-item-edge": EDGE_HEIGHT, // 右下角弧线的高度
}));
</script>

<template>
  <!-- 条目自身作为定位基准，底片与弧角只画在留白区，不参与分片测量。 -->
  <div
    class="resume-item layered-curve-item relative box-border"
    :style="[itemStyle, boxStyle, fragmentStyle]"
  >
    <!-- 上层底片：铺满条目并带圆角，正文落在这层浅底上。 -->
    <span
      aria-hidden="true"
      class="layered-curve-item__plate pointer-events-none absolute inset-0 -z-10"
    />
    <!-- 下层底片：向右下各错位一份距离，右缘勾主题色细线，与标题的层叠方向同向。 -->
    <span
      aria-hidden="true"
      class="layered-curve-item__under pointer-events-none absolute right-[calc(-1*var(--layered-item-offset))] -bottom-[calc(var(--layered-item-offset)+var(--layered-item-edge))] left-3 top-3 -z-10"
    />
    <!-- 右下角弧线：压住下层底片的下沿，右端带圆弧角收住层叠的尾部。 -->
    <span
      aria-hidden="true"
      class="layered-curve-item__edge pointer-events-none absolute -right-[var(--layered-item-offset)] -bottom-[calc(var(--layered-item-offset)+var(--layered-item-edge))] left-3 h-[var(--layered-item-edge)] -z-10"
    />
    <slot />
    <!-- 分片边框沿用共享收边规则，随分片起止收起对应边的描边。 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
  </div>
</template>

<style scoped>
/* 上层底片：圆角沿用分片规则，正文与留白都落在这一层上。 */
.layered-curve-item__plate {
  background-color: var(--layered-item-plate);
  border-radius: inherit;
}

/* 下层底片：右缘用主题色细线勾出弧角轮廓，与上层的圆角语言同源。 */
.layered-curve-item__under {
  border-right: 1px solid var(--layered-item-line);
  border-radius: 0 12px 12px 0;
}

/* 右下角弧线：右端收一个圆弧角，只收住层叠的右下走向。 */
.layered-curve-item__edge {
  background-color: var(--layered-item-line);
  border-radius: 0 6px 6px 0;
}
</style>
