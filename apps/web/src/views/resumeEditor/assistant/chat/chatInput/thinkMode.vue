<script setup>
import { useAiStore } from "@/stores";

const aiStore = useAiStore();
const { thinkMode } = storeToRefs(aiStore);
</script>

<template>
  <div
    class="flex-c relative cursor-pointer rounded-3xl px-2 py-1.5 text-[12px] transition-all duration-300"
    :class="
      thinkMode ? 'bg-sf-theme text-white' : 'text-sf-text-3 hover:bg-sf-bg-2 hover:text-sf-text'
    "
    @click.stop="thinkMode = !thinkMode"
  >
    思考
  </div>
</template>

<style lang="scss" scoped></style>
