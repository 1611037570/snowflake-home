<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, getCurrentInstance, ref } from "vue";
import ResumePages from "./resumePages/index.vue";
import DiffPopover from "./components/diffPopover.vue";
import ExportSuccessModal from "./components/exportSuccessModal.vue";
import { useResumeExport } from "./resumePages/useResumeExport";
import { useSmartOnePage } from "./resumePages/useSmartOnePage";

defineOptions({ name: "ResumePage" });

const resumeStore = useResumeStore();
const { currentData, currentConfig, currentUI, currentFixedConfig, system } =
  storeToRefs(resumeStore);

const exportSuccessModalRef = ref(null);

// 组装可复用组件所需的简历项
const resumeItem = computed(() => ({
  data: currentData.value,
  config: currentConfig.value,
  fixedConfig: currentFixedConfig.value,
  ui: currentUI.value,
}));

// 导出成功：触发导出成功弹窗（由 exportSuccessModal 内部管理弹窗与投递逻辑）
const onExportSuccess = () => {
  exportSuccessModalRef.value?.open();
};
// ---------- 编辑功能注册（导出 / 智能一页 / diff 弹层）----------
// 依赖预览实例的测量结果与导出范围，经组件实例 expose 代理读取，读取时始终取最新值
// 字段与 resumePages/index.vue 的 defineExpose 保持一致：rootEl / measureEl / moduleList
const pagesRef = ref(null);
const isEdit = computed(() => true);
const showPageNumber = computed(() => system.value.showPageNumber);
const previewRootRef = computed(() => pagesRef.value?.rootEl ?? null);
const previewMeasureRef = computed(() => pagesRef.value?.measureEl ?? null);
const previewModuleList = computed(() => pagesRef.value?.moduleList ?? []);
useResumeExport({
  isEdit,
  rootRef: previewRootRef,
  measureRef: previewMeasureRef,
  onExportSuccess,
});
useSmartOnePage({
  ui: currentUI,
  showPageNumber,
  moduleList: previewModuleList,
  currentUI,
  isEdit,
});
</script>

<template>
  <ResumePages ref="pagesRef" :item="resumeItem" />
  <!-- diff 悬浮对比浮层：与编辑功能同层挂载，渲染组件不再感知 -->
  <DiffPopover />
  <!-- 导出成功弹窗（含投递简历入口）由该组件统一管理 -->
  <ExportSuccessModal ref="exportSuccessModalRef" />
</template>

<style scoped></style>
