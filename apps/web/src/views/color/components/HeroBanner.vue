<script setup lang="ts">
import { computed } from "vue";
import { list } from "../data";

const themeGroupCount = computed(() => list.length);
const totalVariableCount = computed(() => list.reduce((acc, curr) => acc + curr.list.length, 0));
</script>

<template>
  <div
    class="border-sf-b relative overflow-hidden rounded-2xl border bg-sf-primary p-8 shadow-sm transition-all hover:shadow-md"
  >
    <div class="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
      <div class="max-w-2xl">
        <h1 class="mb-4 flex items-center gap-3 text-3xl font-bold tracking-tight text-sf-text">
          <SfIcon icon="mdi:palette-swatch" size="8" class="text-sf-theme drop-shadow-sm" />
          系统主题色彩规范
        </h1>
        <p class="text-base leading-relaxed text-sf-text-2">
          系统的全量颜色变量与视觉应用指南。所有的配色均遵循
          <span class="font-medium text-sf-theme">Snowflake Theme</span>
          规范设计，完美适配深浅模式，保证一致的层次感、可读性与无障碍体验。点击下方色块即可一键复制代码。
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-4">
        <div
          class="border-sf-b flex h-28 w-28 flex-col items-center justify-center rounded-xl border bg-sf-bg-2 p-4 transition-transform hover:-translate-y-1 hover:shadow-sm"
        >
          <span class="mb-1 text-3xl font-bold text-sf-theme">{{ themeGroupCount }}</span>
          <span class="text-sm text-sf-text-3">主题色组</span>
        </div>
        <div
          class="border-sf-b flex h-28 w-28 flex-col items-center justify-center rounded-xl border bg-sf-bg-2 p-4 transition-transform hover:-translate-y-1 hover:shadow-sm"
        >
          <span class="mb-1 text-3xl font-bold text-sf-theme">{{ totalVariableCount }}</span>
          <span class="text-sm text-sf-text-3">变量总数</span>
        </div>
      </div>
    </div>

    <!-- 装饰性背景图层 -->
    <div
      class="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-sf-theme opacity-5 blur-[100px] transition-opacity duration-500 hover:opacity-10"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sf-info opacity-5 blur-[100px] transition-opacity duration-500 hover:opacity-10"
    ></div>
  </div>
</template>
