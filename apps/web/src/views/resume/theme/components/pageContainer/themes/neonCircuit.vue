<script setup>
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor, themeColorLine } } = useResumePreviewContext();
</script>

<template>
  <!-- 网格与发光框限制在纸张内，正文仍使用公共页边距和分页。 -->
  <div
    aria-hidden="true"
    class="neon-paper pointer-events-none absolute inset-0 -z-10"
    :style="{ '--neon-accent': themeColor, '--neon-line': themeColorLine }"
  >
    <div class="neon-frame absolute inset-[30px]" />
    <span class="neon-corner neon-corner--top-left" /><span class="neon-corner neon-corner--top-right" />
    <span class="neon-corner neon-corner--bottom-left" /><span class="neon-corner neon-corner--bottom-right" />
  </div>
</template>

<style scoped>
/* 低对比网格只为纸张增加层次，不干扰文字阅读。 */
.neon-paper { background-image: linear-gradient(rgba(75, 124, 134, .08) 1px, transparent 1px), linear-gradient(90deg, rgba(75, 124, 134, .08) 1px, transparent 1px); background-size: 18px 18px; }
.neon-frame { border: 1px solid var(--neon-accent); box-shadow: inset 0 0 11px var(--neon-line), 0 0 10px var(--neon-line); }
.neon-corner { position: absolute; width: 22px; height: 22px; color: var(--neon-accent); filter: drop-shadow(0 0 4px var(--neon-line)); }
.neon-corner--top-left { top: 21px; left: 21px; border-top: 2px solid; border-left: 2px solid; }
.neon-corner--top-right { top: 21px; right: 21px; border-top: 2px solid; border-right: 2px solid; }
.neon-corner--bottom-left { bottom: 21px; left: 21px; border-bottom: 2px solid; border-left: 2px solid; }
.neon-corner--bottom-right { bottom: 21px; right: 21px; border-bottom: 2px solid; border-right: 2px solid; }
</style>
