<script setup>
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";

const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);

// 切换简历页码的显示状态
const togglePageNumber = () => {
  system.value.showPageNumber = !system.value.showPageNumber;
};
</script>

<template>
  <SfTooltip :content="system.showPageNumber ? '隐藏页码' : '显示页码'">
    <SfIcon
      icon="lucide:hash"
      size="5"
      boxSize="7"
      class="rounded-full"
      :class="
        system.showPageNumber
          ? 'bg-sf-theme-2 text-sf-theme-text'
          : 'text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text'
      "
      @click="togglePageNumber"
    />
  </SfTooltip>
</template>
