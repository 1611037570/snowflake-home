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
      <div class="w-[min(520px,80vw)] px-3 pb-3 text-sm leading-7 text-sf-text-2">
        让我来协助你完善简历内容。AI生成结果仅供参考，请结合实际情况判断和修改。
      </div>
    </SfModal>
  </div>
</template>
