<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const emit = defineEmits(["cancel"]);
const progress = ref(0);
let progressTimer;

const clearProgressTimer = () => {
  if (progressTimer) {
    clearTimeout(progressTimer);
    progressTimer = undefined;
  }
};

// 伪进度快速接近 99%，避免让用户误以为生成卡住
const updateProgress = () => {
  if (progress.value >= 99) return;

  const remaining = 99 - progress.value;
  progress.value = Math.min(99, progress.value + Math.max(1, Math.ceil(remaining * 0.18)));
  progressTimer = setTimeout(updateProgress, 55);
};

onMounted(() => {
  progress.value = 8;
  progressTimer = setTimeout(updateProgress, 55);
});

onUnmounted(clearProgressTimer);
// 导出遮罩层
</script>

<template>
  <div
    class="flex-c fixed inset-0 z-90 cursor-not-allowed p-4 backdrop-blur-[2px] select-none"
    role="status"
    aria-live="polite"
    aria-label="正在导出简历，请稍候"
  >
    <div
      class="flex w-52 flex-col items-center gap-4 rounded-2xl border border-sf-theme-2 bg-sf-primary px-5 py-5 text-center shadow-xl"
    >
      <div
        class="relative flex h-12 w-12 items-center justify-center"
        role="progressbar"
        aria-label="导出进度"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="progress"
      >
        <div
          class="absolute inset-0 rounded-full border-2 border-sf-theme-3"
          aria-hidden="true"
        ></div>
        <svg
          class="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="24"
            cy="24"
            r="22"
            class="stroke-sf-theme transition-[stroke-dashoffset] duration-300 ease-out"
            stroke-width="2"
            stroke-linecap="round"
            stroke-dasharray="138.23"
            :stroke-dashoffset="138.23 - (138.23 * progress) / 100"
          />
        </svg>
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-sf-theme-3">
          <SfIcon icon="lucide:sparkles" size="5" class="text-sf-theme" />
        </div>
      </div>

      <div class="flex flex-col items-center gap-1">
        <p class="text-sm font-semibold text-sf-text">正在导出简历</p>
        <p class="text-xs text-sf-text-3">请稍候，文件即将下载 {{ progress }}%</p>
      </div>

      <div class="flex items-center gap-1.5" aria-hidden="true">
        <span class="h-1.5 w-1.5 rounded-full bg-sf-theme motion-safe:animate-bounce"></span>
        <span class="h-1.5 w-1.5 rounded-full bg-sf-theme-2 motion-safe:animate-bounce"></span>
        <span class="h-1.5 w-1.5 rounded-full bg-sf-theme-3 motion-safe:animate-bounce"></span>
      </div>

      <button
        type="button"
        class="rounded-lg border border-sf-b px-3 py-1.5 text-xs text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
        aria-label="取消导出"
        @click="emit('cancel')"
      >
        取消导出
      </button>
    </div>
  </div>
</template>

<style scoped></style>
