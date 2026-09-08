<script setup>
import { storeToRefs } from "pinia";
import { useAiStore } from "@/stores";

const aiStore = useAiStore();
const { thinkMode } = storeToRefs(aiStore);

</script>

<template>
  <!-- 深度思考模式 -->
  <button
    class="relative cursor-pointer rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all duration-300"
    :class="
      thinkMode
        ? 'bg-sf-theme text-white'
        : 'text-sf-text-3 hover:bg-sf-bg-2 hover:text-sf-text'
    "
    @click="thinkMode = !thinkMode"
  >
    深度思考
  </button>
</template>
