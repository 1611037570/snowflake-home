<script setup>
defineOptions({ name: "SfSpan" });
</script>

<template>
  <span class="group relative cursor-pointer font-medium transition-all hover:text-sf-theme">
    <slot />
    <!-- 悬停下划线动画 -->
    <span
      class="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-sf-theme transition-all duration-200 ease-out group-hover:w-full"
    ></span>
  </span>
</template>

<style lang="scss" scoped></style>
