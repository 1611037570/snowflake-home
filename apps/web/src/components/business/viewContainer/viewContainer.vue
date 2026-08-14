<template>
  <div class="flex h-full w-full flex-col">
    <!-- 标题栏 -->
    <Header />
    <!-- 主内容区域 -->
    <main class="w-full flex-1 overflow-hidden bg-sf-bg-hover">
      <slot />
    </main>
    <SfFooter class="text-xs" />
  </div>
</template>

<script setup>
defineOptions({ name: "SfViewContainer" });

import Header from "./header.vue";
</script>

<style scoped></style>
