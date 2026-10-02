<script setup>
import { computed } from "vue";
import { resolveRegionSlot } from "@/views/resume/theme/regionSlots";
import { resolveRegionAppearance } from "./registry";
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
</script>

<template>
  <!-- 区域容器只负责派发区域外观组件；类名与样式由调用方透传，保持同一层级 -->
  <component :is="appearance">
    <slot />
  </component>
</template>

<style lang="scss" scoped></style>
