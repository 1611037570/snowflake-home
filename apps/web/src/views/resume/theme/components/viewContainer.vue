<script setup>
import { FRAME_VIEW_PADDING } from "../styles/frame";
</script>

<template>
  <!-- 白色正文区域向内留白，宽高由分页测量同步扣除。 -->
  <div
    class="resume-view-container relative flex min-w-0"
    :style="{ padding: `${FRAME_VIEW_PADDING}px` }"
  >
    <slot />
  </div>
</template>

<style scoped>
.resume-view-container {
  border-radius: 18px;
  background: #ffffff;
  color: #222222;
}
</style>
