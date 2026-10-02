<script setup>
import { computed } from "vue";
import { resolveRegionSlot } from "@/views/resume/theme/regionSlots";
import { resolveMainRegionAppearanceId, resolveRegionAppearance } from "./registry";
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
// 正文区域的外观可能来自主题声明，也可能来自老简历的历史正文外观，统一由注册表解析
const regionConfig = computed(() => {
  const configured = ui.value?.theme?.region;
  if (slot.value !== "main" || configured?.main) return configured;
  return { ...configured, main: resolveMainRegionAppearanceId(ui.value) };
});
const appearance = computed(() => resolveRegionAppearance(regionConfig.value, slot.value));
</script>

<template>
  <!-- 区域容器只负责派发区域外观组件；类名与样式由调用方透传，与旧版裸元素保持同一层级 -->
  <component :is="appearance">
    <slot />
  </component>
</template>

<style lang="scss" scoped></style>
