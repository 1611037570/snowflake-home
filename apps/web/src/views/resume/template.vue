<script setup>
import { useResumeStore } from "@/stores";
import { xiaoYangResumeItem } from "@/stores/modules/resume/xiaoYangData";
import ResumeCardContainer from "@/views/resume/mine/components/resumeCardContainer.vue";

const resumeStore = useResumeStore();

// 使用模板
const selectTemplate = () => {
  resumeStore.addResume(xiaoYangResumeItem);
};
</script>

<template>
  <SfScrollbar class="h-full">
    <div class="relative z-4 mx-auto flex w-[1120px] flex-col gap-4">
      <div class="flex h-8 items-center">
        <h2 class="text-[20px] font-black text-sf-theme">风格模板</h2>
      </div>
      <ResumeCardContainer :item="xiaoYangResumeItem" @click="selectTemplate" />
    </div>
  </SfScrollbar>
</template>

<style lang="scss" scoped></style>
