<script setup></script>

<template>
  <div class="w-dwh flex-c relative min-h-dvh overflow-hidden bg-amber-200">
    <!-- 背景装饰 -->
    <div class="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-sf-theme-hover blur-3xl"></div>
    <div
      class="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-sf-theme-hover blur-2xl"
    ></div>
    <div class="relative h-[200px] rounded-xl border border-sf-theme-hover bg-sf-theme-hover p-4">
      <div class="text-7xl">Hi~ 我是<span class="pl-4 text-sf-theme">牛马</span></div>
      <div class="flex">
        现居：乌镇的

        <div class="text-3xl">前端开发 & 人像摄影师</div>
      </div>
      <div
        class="flex-c absolute -right-12 -bottom-12 z-10 h-22 w-22 rotate-3 flex-col rounded-xl bg-sf-theme shadow-2xl transition-all duration-300 hover:scale-105 hover:rotate-0 hover:shadow-sf-theme/20"
      >
        <div class="text-3xl font-bold text-sf-primary">7 <span class="text-xl">年</span></div>
        <div class="mt-1 text-sm text-sf-transparent">开发经验</div>
      </div>
      <div
        class="flex-c absolute right-6 -bottom-12 z-10 h-22 w-22 rotate-3 flex-col rounded-xl bg-sf-theme shadow-2xl transition-all duration-300 hover:scale-105 hover:rotate-0 hover:shadow-sf-theme/20"
      >
        <div class="text-3xl font-bold text-sf-primary">4 <span class="text-xl">年</span></div>
        <div class="mt-1 text-sm text-sf-transparent">摄影经验</div>
      </div>
    </div>
    <div class="flex-c absolute bottom-12 left-0 w-full text-4xl text-sf-base">v</div>
  </div>
</template>

<style lang="scss" scoped></style>
