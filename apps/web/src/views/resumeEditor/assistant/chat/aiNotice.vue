<script setup>
import { ref } from "vue";

const visible = ref(false);
</script>

<template>
  <div
    class="mt-3 flex items-center justify-center gap-1.5 text-[11px] tracking-wider text-sf-text-3 opacity-60 transition-opacity hover:opacity-100"
  >
    <button
      type="button"
      class="flex cursor-pointer items-center transition-colors hover:text-sf-theme"
      @click="visible = true"
    >
      <SfIcon icon="ph:info-duotone" size="3" />
      {{ $t("router.resumeAI") }}
    </button>
    <span>生成仅供参考，请保持独立思考。</span>

    <SfModal v-model="visible" :title="$t('router.resumeAI')">
      <div class="flex w-[350px] flex-col">
        <!-- AI宣传语 -->
        <div class="flex-c mb-3 text-base">
          {{ $t("router.resumeAIDesc") }}
        </div>
        <!-- ai介绍 -->
        <div class="text-sf-text" style="display: ruby">
          基于
          <span class="font-semibold text-sf-theme">{{ $t("router.resume") }}</span>
          深度定制的智能 Agent，围绕简历场景精心打磨专属 Prompt，让你的简历脱颖而出
        </div>
      </div>
    </SfModal>
  </div>
</template>
