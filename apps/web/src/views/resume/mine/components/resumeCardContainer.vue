<script setup>
// 简历卡片容器：仅负责卡片最外层样式与点击交互，内容由插槽传入
const emit = defineEmits(["click"]);
</script>

<template>
  <div
    class="group flex cursor-pointer flex-col rounded-xl border border-sf-b bg-sf-primary p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-sf-theme"
    @click="emit('click')"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
