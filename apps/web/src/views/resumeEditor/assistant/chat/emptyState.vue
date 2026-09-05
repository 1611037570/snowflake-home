<script setup lang="ts">
import type { SuggestCard } from "../../types";

const props = defineProps<{ suggestions: SuggestCard[] }>();
const emit = defineEmits(["switch-mode", "suggest"]);

// 点击建议卡片，启动对应流程
const handleSuggest = (card) => {
  emit("suggest", { flow: card.flow });
};
</script>

<template>
  <div class="mt-20 flex w-full flex-1 flex-col items-center justify-center gap-3 text-center">
    <div class="flex-c gap-3 text-2xl font-bold text-sf-base">
      你好，我是 <span class="text-sf-theme">{{ $t("router.resumeAI") }}</span>
      <SfIcon icon="lucide:sparkles" class="text-sf-theme" size="6" />
    </div>
    <div
      class="flex flex-wrap items-center justify-center gap-1.5 text-sm font-medium text-sf-base"
    >
      <span>能通过对话帮你打造受HR青睐的专业简历。</span>
      <span>尝试和我对话吧！ 📄✨</span>
    </div>

    <!-- 建议操作按钮 -->
    <div class="grid w-full max-w-md grid-cols-2 gap-3">
      <button
        v-for="card in props.suggestions"
        :key="card.title"
        class="group/card flex cursor-pointer items-center gap-3 rounded-xl bg-sf-bg p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-sf-theme active:scale-[0.98]"
        @click="handleSuggest(card)"
      >
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sf-bg-2 text-sf-text-3 transition-colors duration-300 group-hover/card:bg-sf-theme-3 group-hover/card:text-sf-theme"
        >
          <SfIcon :icon="card.icon" size="4.5" />
        </div>
        <div class="flex flex-col gap-0.5 overflow-hidden">
          <h3 class="text-[13px] font-bold tracking-tight text-sf-text">
            {{ card.title }}
          </h3>
          <p class="truncate text-[10px] text-sf-text-2">
            {{ card.desc }}
          </p>
        </div>
      </button>
    </div>
  </div>
</template>
