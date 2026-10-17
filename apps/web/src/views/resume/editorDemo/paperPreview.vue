<script setup>
// 右侧画布静态 Demo：视图条收敛为五个入口，纸张靠阴影与画布分开
import { DEMO_PAPER } from "./mockContent";
</script>

<template>
  <section class="flex min-w-0 flex-1 flex-col bg-sf-bg">
    <!-- 视图条 44px：外观 / 版式 / 语言 与缩放分开，右侧只放页数 -->
    <div class="flex h-11 shrink-0 items-center gap-3 border-b border-sf-b bg-sf-primary px-3">
      <div class="flex items-center gap-1.5 text-[12px] text-sf-text">
        <SfIcon icon="lucide:swatch-book" size="4" />
        外观
        <SfIcon icon="ph:caret-down-bold" size="3" class="text-sf-text-3" />
      </div>
      <div class="flex items-center gap-1.5 text-[12px] text-sf-text">
        <SfIcon icon="lucide:layout-template" size="4" />
        版式
        <SfIcon icon="ph:caret-down-bold" size="3" class="text-sf-text-3" />
      </div>
      <div class="flex items-center gap-1.5 text-[12px] text-sf-text-2">
        <SfIcon icon="mdi:translate" size="4" />
        语言
      </div>
      <span class="h-5 w-px bg-sf-b"></span>
      <div class="flex items-center gap-1.5 text-[12px] text-sf-text-2">
        缩放
        <span class="text-sf-text">62%</span>
        <SfIcon icon="ph:caret-down-bold" size="3" class="text-sf-text-3" />
      </div>
      <div class="ml-auto flex items-center gap-3 text-[12px] text-sf-text-3">
        <span>1 / 3 页</span>
        <SfIcon icon="lucide:maximize" size="4" class="text-sf-text-2" />
      </div>
    </div>

    <!-- 画布：纸张居中，四周留白 24，阴影拉开与画布的层级 -->
    <div class="flex min-h-0 flex-1 items-center justify-center px-6 py-6">
      <div
        class="demo-paper flex h-full max-h-[660px] aspect-[794/1123] flex-col bg-sf-primary px-12 py-12"
      >
        <header class="shrink-0">
          <h1 class="text-[22px] leading-7 font-bold text-sf-text">{{ DEMO_PAPER.name }}</h1>
          <p class="mt-1.5 text-[12px] text-sf-theme">{{ DEMO_PAPER.position }}</p>
          <p class="mt-3 text-[10px] text-sf-text-3">{{ DEMO_PAPER.contact }}</p>
        </header>

        <div class="mt-6 flex flex-col gap-6">
          <section v-for="section in DEMO_PAPER.sections" :key="section.title">
            <h2 class="border-b border-sf-b pb-1.5 text-[12px] font-bold text-sf-text">
              {{ section.title }}
            </h2>
            <div class="mt-1.5 flex flex-col gap-3">
              <article v-for="item in section.items" :key="item.heading">
                <div class="flex items-baseline justify-between gap-3">
                  <h3 class="text-[10px] font-semibold text-sf-text">{{ item.heading }}</h3>
                  <span class="shrink-0 text-[10px] text-sf-text-3">{{ item.meta }}</span>
                </div>
                <p
                  v-for="line in item.lines"
                  :key="line"
                  class="mt-1.5 text-[10px] leading-5 text-sf-text-2"
                >
                  {{ line }}
                </p>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 纸张阴影：与左栏卡片同一套层级语言，深色模式减弱 */
.demo-paper {
  border-radius: 2px;
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--sf-base) 8%, transparent),
    0 18px 48px color-mix(in srgb, var(--sf-base) 10%, transparent);
}

:global(.dark) .demo-paper {
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--sf-base) 4%, transparent),
    0 18px 48px color-mix(in srgb, var(--sf-base) 6%, transparent);
}
</style>
