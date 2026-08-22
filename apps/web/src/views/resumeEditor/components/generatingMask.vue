<script setup>
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";

const resumeStore = useResumeStore();
const { isGenerating } = storeToRefs(resumeStore);
// AI 生成中蒙层
</script>

<template>
  <div
    v-if="isGenerating"
    class="flex-c border-sf-b absolute inset-0 z-50 cursor-not-allowed rounded-xl border bg-sf-transparent-3"
  >
    <div class="rounded-xl bg-sf-theme-2 px-4 py-2 text-sf-theme">AI生成中 请稍等</div>
  </div>
</template>

<style scoped></style>
