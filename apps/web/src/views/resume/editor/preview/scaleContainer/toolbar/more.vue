<script setup>
// 移动端预览工具栏「更多」：彩色、全屏、疑问与智能一页纸统一收进一个下拉入口
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { $t } from "@/locales";
import { useResumeStore } from "@/stores";
import eventBus from "@/utils/modules/eventBus";

const emit = defineEmits(["fullscreen", "standardA4"]);
const { proxy } = getCurrentInstance();
const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);

// 彩色/灰度切换：与桌面入口共用预览的打印模式状态
const togglePrintMode = () => {
  system.value.printMode = !system.value.printMode;
};
// 疑问：确认后切到标准 A4 查看真实排版
const openStyleHint = () => {
  proxy
    .$confirm($t("styleHintContent"), $t("styleHintHover"))
    .then(() => emit("standardA4"))
    // 取消：保持当前缩放模式
    .catch(() => undefined);
};
// 智能一页纸：通知编辑器预览实例执行压缩
const fitOnePage = () => eventBus.emit("resume-smart-one-page");

// 收起后的入口清单：名称取当前状态，图标与桌面入口一致
const moreList = computed(() => [
  {
    name: system.value.printMode ? $t("previewColorMode") : $t("previewGrayMode"), // 当前预览配色状态
    icon: system.value.printMode
      ? "qlementine-icons:light-bulb-off-16"
      : "qlementine-icons:light-bulb-on-16", // 与状态对应的灯泡图标
    active: system.value.printMode, // 灰度模式下显示选中标记
    fn: togglePrintMode,
  },
  {
    name: $t("fullscreen"), // 全屏预览
    icon: "lucide:maximize",
    fn: () => emit("fullscreen"),
  },
  {
    name: $t("styleHintHover"), // 样式疑问
    icon: "mingcute:question-line",
    fn: openStyleHint,
  },
  {
    name: $t("smartOnePage"), // 智能一页纸
    icon: "mdi:atom",
    fn: fitOnePage,
  },
]);
</script>

<template>
  <SfDropdown trigger="click" placement="bottom-start" :show-arrow="false">
    <SfIcon
      icon="mdi:dots-horizontal"
      size="5"
      boxSize="7"
      class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
    />
    <template #dropdown>
      <SfList :list="moreList" class="w-45" />
    </template>
  </SfDropdown>
</template>

<style lang="scss" scoped></style>
