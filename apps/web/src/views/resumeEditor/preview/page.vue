<script setup>
import { useResumeStore } from "@/stores";
import eventBus from "@/utils/modules/eventBus";
import { storeToRefs } from "pinia";
import { computed, onMounted, onUnmounted } from "vue";
import GeneratingMask from "../components/generatingMask.vue";
import ModuleActions from "./components/moduleActions.vue";
import ResumePages from "./resumePages/index.vue";
import { usePdfExport } from "./usePdfExport";

defineOptions({ name: "ResumePage" });

const resumeStore = useResumeStore();
const { currentData, currentConfig, currentUI, currentFixedConfig } = storeToRefs(resumeStore);

// 组装可复用组件所需的简历项
const resumeItem = computed(() => ({
  data: currentData.value,
  config: currentConfig.value,
  fixedConfig: currentFixedConfig.value,
  ui: currentUI.value,
}));

// 使用 usePdfExport 提供 PDF 导出能力
const { printPDF } = usePdfExport();

onMounted(() => {
  eventBus.on("resume-print-pdf", printPDF);
});

onUnmounted(() => {
  eventBus.off("resume-print-pdf", printPDF);
});
</script>

<template>
  <GeneratingMask />
  <ResumePages :item="resumeItem">
    <template #moduleActions="{ slice }">
      <ModuleActions :modelKey="slice.moduleKey" />
    </template>
  </ResumePages>
</template>

<style scoped></style>
