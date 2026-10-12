<script setup>
import TitleText from "../titleText.vue";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题文字
});
</script>

<template>
  <!-- 标题、方形节点与横线共用正文容器声明的日期侧栏位置。 -->
  <div class="square-timeline-title relative flex min-h-6 min-w-0 items-center">
    <h2 class="min-w-0 pr-3 text-right font-bold break-words">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style scoped>
.square-timeline-title {
  color: var(--square-timeline-color);
}

.square-timeline-title h2 {
  width: calc(var(--square-timeline-rail-width) - 18px);
}

.square-timeline-title::before,
.square-timeline-title::after {
  content: "";
  position: absolute;
  top: 50%;
  left: calc(var(--square-timeline-rail-width) - 18px);
  background-color: currentColor;
  pointer-events: none;
}

.square-timeline-title::before {
  width: 9px;
  height: 9px;
  border-radius: 2px;
  transform: translate(-50%, -50%);
}

.square-timeline-title::after {
  right: 0;
  height: 1px;
}
</style>
