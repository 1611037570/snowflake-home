<script setup>
import { computed } from "vue";
import { resolveRegionSlot } from "@/views/resume/theme/regionSlots";
import { resolveViewTemplate } from "@/views/resume/theme/regionPadding";
import { resolveRegionAppearance } from "./registry";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  // 引擎下发的区域编号：header 承载个人信息，main 承载正文
  regionId: {
    type: String,
    required: true,
  },
});
const { ui } = useResumePreviewContext();
// 区域外观由主题按槽位指定，编号缺失或非法时回退到槽位缺省外观。
// 老简历的正文外观写在 ui.theme.view 里，没有区域声明，这里补回正文槽位的编号。
const regionConfig = computed(() => {
  const configured = ui.value?.theme?.region;
  if (!configured?.main && resolveRegionSlot(props.regionId) === "main") {
    return { ...configured, main: resolveViewTemplate(ui.value) };
  }
  return configured;
});
const appearance = computed(() =>
  resolveRegionAppearance(regionConfig.value, resolveRegionSlot(props.regionId)),
);
</script>

<template>
  <!-- 区域容器只负责派发外观组件；类名与样式由调用方透传，与旧版裸元素保持同一层级 -->
  <component :is="appearance">
    <slot />
  </component>
</template>

<style lang="scss" scoped></style>
