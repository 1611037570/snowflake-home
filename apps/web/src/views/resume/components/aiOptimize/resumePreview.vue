<script setup lang="ts">
import { computed, ref } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { useResumeStore } from "@/stores";
import ResumePages from "../../editor/preview/resumePages/index.vue";
import { RESUME_HEIGHT, RESUME_WIDTH } from "../../editor/preview/shared/constants";

defineProps<{ item: Record<string, any> /* 只读预览来源，支持完整的多页简历。 */ }>();
const store = useResumeStore();
const viewport = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);
const width = ref(RESUME_WIDTH);
const height = ref(RESUME_HEIGHT);
const scale = computed(() => Math.min(1, Math.max(1, width.value) / RESUME_WIDTH));
// 仅缩放纸张显示，不修改模板、字号或用户设置的简历页边距。
useResizeObserver(viewport, ([entry]) => { if (entry && entry.contentRect.width > 0) width.value = entry.contentRect.width; });
useResizeObserver(content, ([entry]) => { if (entry) height.value = Math.max(RESUME_HEIGHT, entry.contentRect.height); });
</script>

<template>
  <!-- 横向留白由 SfScrollbar 内置 px-3 提供，内容仅补纵向间距。 -->
  <SfScrollbar class="h-full min-h-0 bg-sf-bg">
    <div ref="viewport" class="w-full shrink-0 py-3">
      <div class="relative mx-auto" :style="{ width: `${RESUME_WIDTH * scale}px`, height: `${height * scale}px` }">
        <div ref="content" class="absolute top-0 left-0 origin-top-left" :style="{ width: `${RESUME_WIDTH}px`, transform: `scale(${scale})` }">
          <ResumePages :item="item" :show-page-number="store.system.showPageNumber" mode="preview" :show-editor-interactions="false" />
        </div>
      </div>
    </div>
  </SfScrollbar>
</template>
