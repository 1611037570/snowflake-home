<script setup>
import { computed } from "vue";
import { resolveRegionSlot } from "@/views/resume/theme/regionSlots";
import { resolveRegionAppearance, resolveRegionAppearancePadding } from "./registry";
import { layoutStretchesColumns } from "@/views/resume/theme/layouts";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  // 引擎下发的区域编号：slogan 承载标语，user 承载个人信息，main 承载正文
  regionId: {
    type: String,
    required: true,
  },
});
const { ui } = useResumePreviewContext();
const slot = computed(() => resolveRegionSlot(props.regionId));
// 区域外观只按主题编号选择，具体样式由对应组件维护。
const appearance = computed(() => resolveRegionAppearance(ui.value?.theme?.template, slot.value));
// 正文外观与剩余空间共用同一个根容器，留白与分页读取相同的组件声明。
const mainStyle = computed(() => {
  if (slot.value !== "main") return undefined;
  const padding = resolveRegionAppearancePadding(ui.value?.theme?.template, "main", ui.value);
  const bottomSpace = layoutStretchesColumns(ui.value?.layout?.type)
    ? "var(--resume-bottom-space, 0px)"
    : "0px";
  return {
    paddingTop: `${padding.top}px`, // 正文顶部留白
    paddingRight: `${padding.right}px`, // 正文右侧留白
    paddingBottom: `calc(${padding.bottom}px + ${bottomSpace})`, // 正文底部留白与栏内页尾空间
    paddingLeft: `${padding.left}px`, // 正文左侧留白
  };
});
</script>

<template>
  <!-- 正文直接在外观组件根元素上应用布局，不额外包裹背景层或内容层。 -->
  <component
    :is="appearance"
    :class="{ 'resume-view-container relative box-border flex w-full min-h-0 min-w-0 flex-1': slot === 'main' }"
    :style="mainStyle"
  >
    <slot />
  </component>
</template>

<style lang="scss" scoped></style>
