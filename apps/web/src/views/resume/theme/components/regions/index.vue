<script setup>
import { computed } from "vue";
import { resolveRegionSlot } from "@/views/resume/theme/regionSlots";
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
// 区域外观由主题按槽位指定，编号缺失或非法时回退到槽位缺省外观
const appearance = computed(() =>
  resolveRegionAppearance(ui.value?.theme?.region, resolveRegionSlot(props.regionId)),
);
</script>

<template>
  <!-- 区域容器只负责派发外观组件；类名与样式由调用方透传，与旧版裸元素保持同一层级 -->
  <component :is="appearance">
    <slot />
  </component>
</template>

<style lang="scss" scoped></style>
