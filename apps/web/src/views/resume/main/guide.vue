<script setup></script>

<template>
  <!-- 向下滚动提示 -->
  <div class="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 justify-center">
    <div class="flex flex-col items-center gap-2 text-sf-text">
      <span class="text-xs">向下滚动</span>
      <div class="flex h-10 w-6 justify-center rounded-full border-2 border-sf-text-3 pt-2">
        <div class="h-3 w-1.5 animate-bounce rounded-full bg-sf-text"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
