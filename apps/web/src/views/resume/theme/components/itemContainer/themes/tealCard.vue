<script setup>
import { computed } from "vue";
import { getItemFragmentStyle } from "@/views/resume/editor/preview/resumePages/render/itemStyle";

const props = defineProps({
  blockRange: { // 分片覆盖的块区间
    type: Object,
    default: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }),
  },
  contentRange: { type: Object, default: undefined }, // 分片覆盖的正文区间
  decoration: { type: String, default: "full" }, // 分片装饰类型
});
// 卡片由模块绘制，条目仅提供测量与渲染共用的留白和续段收边规则。
const fragmentStyle = computed(() =>
  getItemFragmentStyle(props.blockRange, props.contentRange, props.decoration, "0"),
);
</script>

<template>
  <div class="resume-item box-border py-3" :style="[{ paddingLeft: '18px', paddingRight: '18px' }, fragmentStyle]">
    <slot />
  </div>
</template>

<style scoped>
/* 顶带自行占位，条目外壳不对它附加卡片留白。 */
.resume-item:has(> .teal-card-band) {
  padding: 0 !important;
}
</style>
