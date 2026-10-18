<script setup>
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { $t } from "@/locales";

const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);

// 切换打印模式：打印模式下预览去色，模拟黑白打印效果
const togglePrintMode = () => {
  system.value.printMode = !system.value.printMode;
};
</script>

<template>
  <!-- 即时切换只用选中态反馈，避免与耗时操作的加载状态混淆。 -->
  <SfTooltip :content="system.printMode ? $t('printColorMode') : $t('printGrayMode')">
    <SfIcon
      :icon="
        system.printMode
          ? 'qlementine-icons:light-bulb-off-16'
          : 'qlementine-icons:light-bulb-on-16'
      "
      size="5"
      boxSize="7"
      class="rounded-full"
      :class="
        system.printMode
          ? 'bg-sf-theme-2 text-sf-theme hover:bg-sf-theme-2'
          : 'text-sf-warning hover:bg-sf-warning-2'
      "
      @click="togglePrintMode"
    />
  </SfTooltip>
</template>
