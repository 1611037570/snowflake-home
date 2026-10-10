<script setup>
import { computed, ref, watch, nextTick } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { useResumePreviewContext } from "../../shared/previewContext";
import { getContentHeight } from "../../shared/constants";
import { getRegionPaddingHeight } from "../engine/layout/regionHeights";

const props = defineProps({
  // 图片作品的名称、描述、图片和显示尺寸数据。
  item: { type: Object, required: true },
  // 已校验的作品链接，为空时仅展示名称。
  url: { type: String, default: "" },
});
const { layout, themeDecisions, ui, showPageNumber, theme: { linkUnderline } } = useResumePreviewContext();
const rootRef = ref(null);
const captionRef = ref(null);
const imageMaxHeight = ref(0);
const hasCaption = computed(() => Boolean(props.url || props.item.name || props.item.desc));
// 尺寸设置同时控制图片区域的宽高，百分之百使用扣除说明后的整页空间。
const imageSizeRatio = computed(() => Math.min(100, Math.max(0, Number(props.item.size ?? 50) || 0)) / 100);
// 以完整后续页为上限，当前页放不下时由分页引擎顺延，避免缩成页尾的小图。
const pageHeight = computed(() => {
  // 正文区域上下留白沿用引擎的同一份口径，不在这里另写一遍求和
  const regionPaddingHeight = getRegionPaddingHeight({
    padding: layout.value.regions.find((region) => region.id === "main")?.padding, // 读取结算后的留白，包含页面上边距注入
  });
  return Math.max(0, getContentHeight(
    Number(ui.value.page?.padding?.vertical) || 0,
    showPageNumber.value,
    Number(themeDecisions.value.pageBorder.width) || 0,
  ) - regionPaddingHeight);
});
// 先扣除名称、描述、间距和条目外观留白，再给图片分配剩余高度。
const updateImageHeight = () => {
  const root = rootRef.value;
  if (!root) return;
  const captionHeight = captionRef.value ? Number.parseFloat(getComputedStyle(captionRef.value).height) || 0 : 0;
  const itemBox = root.closest(".resume-item");
  const itemStyle = itemBox ? getComputedStyle(itemBox) : null;
  const boxSpacing = itemStyle
    ? [itemStyle.paddingTop, itemStyle.paddingBottom, itemStyle.borderTopWidth, itemStyle.borderBottomWidth]
      .reduce((height, value) => height + (Number.parseFloat(value) || 0), 0)
    : 0;
  const gap = props.item.img && hasCaption.value ? Number.parseFloat(getComputedStyle(root).rowGap) || 0 : 0;
  imageMaxHeight.value = Math.max(0, pageHeight.value - captionHeight - boxSpacing - gap);
};
// 字体、栏宽及说明变化后重新分配高度，读取布局尺寸不受预览缩放影响。
useResizeObserver([rootRef, captionRef], updateImageHeight);
watch([pageHeight, () => props.item, hasCaption], async () => {
  await nextTick();
  updateImageHeight();
}, { deep: true, immediate: true });
</script>

<template>
  <figure ref="rootRef" class="m-0 flex w-full min-w-0 flex-col items-center gap-3">
    <img
      v-if="item.img"
      :src="item.img"
      :alt="item.name || ''"
      class="block shrink-0 object-contain"
      :style="{ width: `${imageSizeRatio * 100}%`, height: `${imageMaxHeight * imageSizeRatio}px` }"
      @load="updateImageHeight"
    />
    <figcaption v-if="hasCaption" ref="captionRef" class="flex w-full min-w-0 flex-col gap-3 break-words">
      <a
        v-if="url"
        :href="url"
        target="_blank"
        rel="noopener noreferrer"
        class="block text-center hover:underline"
        :class="{ underline: linkUnderline }"
      >
        {{ item.name || item.url }}
      </a>
      <span v-else-if="item.name" class="block text-center">{{ item.name }}</span>
      <span v-if="item.desc">{{ item.desc }}</span>
    </figcaption>
  </figure>
</template>
