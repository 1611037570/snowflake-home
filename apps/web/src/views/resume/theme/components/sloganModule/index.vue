<script setup>
import { computed } from "vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import DefaultSlogan from "./themes/default.vue";
import SloganBand from "./themes/sloganBand.vue";
import BurgundySidebar from "./themes/burgundySidebar.vue";

// 入口只按主题编号选择标语内容组件，内容与尺寸由各组件维护。
const sloganComponents = {
  sloganBand: SloganBand, // 标语通栏的固定文案
  burgundySidebar: BurgundySidebar, // 绛红装饰带的分页占位
};
const { ui } = useResumePreviewContext();
const current = computed(() => sloganComponents[ui.value?.theme?.template] || DefaultSlogan);
</script>

<template>
  <component :is="current" />
</template>
