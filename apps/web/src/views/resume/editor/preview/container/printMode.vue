<script setup>
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";

const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);

// 切换打印模式：打印模式下预览去色，模拟黑白打印效果
const togglePrintMode = () => {
  system.value.printMode = !system.value.printMode;
};
</script>

<template>
  <SfTooltip :content="system.printMode ? '彩色模式' : '打印模式'">
    <SfIcon
      :icon="system.printMode ? 'lucide:printer' : 'lucide:palette'"
      size="5"
      boxSize="7"
      class="rounded-full"
      :class="
        system.printMode
          ? 'text-sf-theme hover:bg-sf-theme-2'
          : 'text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text'
      "
      @click="togglePrintMode"
    />
  </SfTooltip>
</template>
