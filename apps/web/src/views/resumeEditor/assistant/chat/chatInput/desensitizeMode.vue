<script setup>
import { storeToRefs } from "pinia";
import { useAiStore } from "@/stores";

const aiStore = useAiStore();
const { desensitizeMode } = storeToRefs(aiStore);
</script>

<template>
  <!-- 脱敏操作模式 -->
  <SfTooltip content="脱敏后不上传敏感信息，如手机号、邮箱等，由用户自己处理。">
    <button
      class="flex-c relative cursor-pointer rounded-xl px-2 py-1 text-[11px] font-semibold transition-all duration-300"
      :class="
        desensitizeMode
          ? 'bg-sf-theme text-white'
          : 'text-sf-text-3 hover:bg-sf-bg-2 hover:text-sf-text'
      "
      @click="desensitizeMode = !desensitizeMode"
    >
      脱敏
    </button>
  </SfTooltip>
</template>
