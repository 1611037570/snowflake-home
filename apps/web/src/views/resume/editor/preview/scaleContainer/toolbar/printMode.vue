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
  <!-- 工具栏入口：图标尺寸与其它入口一致 -->
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
          ? 'text-sf-text-2 hover:bg-sf-warning-2 hover:text-sf-warning'
          : 'text-sf-warning hover:bg-sf-warning-2'
      "
      @click="togglePrintMode"
    />
  </SfTooltip>
</template>
