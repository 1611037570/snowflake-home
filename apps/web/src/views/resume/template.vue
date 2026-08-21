<script setup>
import { useResumeStore } from "@/stores";
import { xiaoYangResumeItem } from "@/stores/modules/resume/xiaoYangData";

const resumeStore = useResumeStore();

// 使用模板
const selectTemplate = () => {
  resumeStore.addResume(xiaoYangResumeItem);
};
</script>

<template>
  <div class="relative z-4 mx-auto flex w-[1120px] flex-col gap-4">
    <div class="flex h-8 items-center">
      <h2 class="text-[20px] font-black text-sf-theme">风格模板</h2>
    </div>
    <div class="group relative h-[400px] w-[282px] rounded-xl bg-sf-theme">
      <div
        class="absolute top-0 left-0 flex h-full w-full items-end justify-center rounded-xl bg-sf-primary pb-6 transition-all duration-300 group-hover:top-[-6px] group-hover:left-[-6px]"
      >
        <button
          type="button"
          class="cursor-pointer! rounded-xl bg-sf-theme px-4 py-2 text-sm font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          @click="selectTemplate"
        >
          使用模板
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
