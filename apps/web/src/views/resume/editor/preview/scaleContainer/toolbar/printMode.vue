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
    <button
      type="button"
      class="flex h-6 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2 text-[11px] transition-colors"
      :class="
        system.printMode
          ? 'bg-sf-theme-2 text-sf-theme'
          : 'text-sf-text-2 hover:bg-sf-bg'
      "
      :aria-pressed="system.printMode"
      @click="togglePrintMode"
    >
      <SfIcon
        :icon="
          system.printMode
            ? 'qlementine-icons:light-bulb-off-16'
            : 'qlementine-icons:light-bulb-on-16'
        "
        size="4"
        :class="system.printMode ? '' : 'text-sf-warning'"
      />
      <span class="whitespace-nowrap">{{ $t("grayPrintMode") }}</span>
    </button>
  </SfTooltip>
</template>
