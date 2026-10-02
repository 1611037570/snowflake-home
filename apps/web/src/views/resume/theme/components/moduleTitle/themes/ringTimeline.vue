<script setup>
import TitleText from "../titleText.vue";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题文字
});
</script>

<template>
  <!-- 标题让出左侧时间轴栏，实心节点落在贯穿轴线上，与条目空心圆环形成层级对比 -->
  <div
    class="ring-timeline-title relative flex min-w-0 items-center"
    :style="{ paddingLeft: 'var(--timeline-rail-width)' }"
  >
    <h2 class="min-w-0 font-bold break-words">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style scoped>
/* 轴线补齐上一模块到本标题之间的间距，使各模块的轴线连成一条 */
.ring-timeline-title::before {
  content: "";
  position: absolute;
  top: calc(-1 * var(--ring-module-gap));
  bottom: 0;
  left: calc(var(--timeline-rail-width) - 18px);
  width: 1px;
  background-color: var(--ring-line);
  pointer-events: none;
}

/* 标题节点：模块起点用实心圆点标记，落在轴线正中 */
.ring-timeline-title::after {
  content: "";
  position: absolute;
  top: 50%;
  left: calc(var(--timeline-rail-width) - 18px);
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background-color: var(--ring-node);
  transform: translate(-50%, -50%);
  pointer-events: none;
}
</style>
