<script setup>
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";

const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);
</script>

<template>
  <div
    v-if="system.showProgress"
    class="absolute -top-12 -right-10 z-50 -translate-y-1/2 transform"
  >
    <div
      class="h-[66px] w-[90px] cursor-pointer rounded-2xl bg-linear-to-r from-blue-500 to-purple-500 p-3 text-white transition-all duration-300 hover:scale-105"
    >
      <div class="flex w-10 flex-col items-center justify-center">
        <div class="flex items-center text-[16px] font-bold">
          <span>100</span><span class="text-[14px]">%</span>
        </div>
        <div class="text-[11px] opacity-90">完成度</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
