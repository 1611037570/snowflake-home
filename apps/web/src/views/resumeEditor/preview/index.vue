<script setup>
// 简历页面渲染组件
import ResumePage from "./page.vue";
// 缩放容器组件
import ScaleContainer from "./ScaleContainer.vue";
</script>

<template>
  <div
    class="scrollbar-hide relative flex h-full flex-1 flex-col items-center overflow-y-auto pt-3"
  >
    <ScaleContainer>
      <ResumePage />
    </ScaleContainer>
  </div>
</template>

<style scoped></style>
