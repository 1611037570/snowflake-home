<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, getCurrentInstance, ref } from "vue";
import ResumePages from "./resumePages/index.vue";
import DiffPopover from "./components/diffPopover.vue";
import DeliverResume from "@/views/resume/mine/deliverResume.vue";
import { useResumeExport } from "./resumePages/useResumeExport";
import { useSmartOnePage } from "./resumePages/useSmartOnePage";

defineOptions({ name: "ResumePage" });

const resumeStore = useResumeStore();
const { currentData, currentConfig, currentUI, currentFixedConfig, system } =
  storeToRefs(resumeStore);

const { proxy } = getCurrentInstance();
const deliverResumeRef = ref(null);

// 组装可复用组件所需的简历项
const resumeItem = computed(() => ({
  data: currentData.value,
  config: currentConfig.value,
  fixedConfig: currentFixedConfig.value,
  ui: currentUI.value,
}));

// 导出成功：询问是否投递简历
const onExportSuccess = () => {
  proxy
    .$confirm("简历导出成功，是否前去投递简历？", "导出成功", {
      cancelText: "继续编辑",
      confirmText: "投递简历",
    })
    .then(() => {
      deliverResumeRef.value?.open();
    });
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
  <DeliverResume ref="deliverResumeRef">
    <span />
  </DeliverResume>
</template>

<style scoped></style>