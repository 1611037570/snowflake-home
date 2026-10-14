<script setup>
import DefaultItem from "./default.vue";

const props = defineProps({
  blockRange: { type: Object, default: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }) }, // 当前分片的内容块区间
  contentRange: { type: Object, default: undefined }, // 当前分片的正文区间
  decoration: { type: String, default: "full" }, // 分片的装饰阶段
  timeline: { type: Boolean, default: false }, // 是否预留时间轴日期栏
});
</script>

<template>
  <!-- 沿用公共条目盒模型，只将日期文字标成参考图的浅金色。 -->
  <DefaultItem v-bind="props" class="forest-chalk-item"><slot /></DefaultItem>
</template>

<style scoped>
.forest-chalk-item :deep(.flex.max-w-full.min-w-0.flex-wrap.items-center > span) {
  color: #F2DEA0;
}
</style>
