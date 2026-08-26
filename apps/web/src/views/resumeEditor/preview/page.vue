<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, inject } from "vue";
import ModuleActions from "./components/moduleActions.vue";
import ResumePages from "./resumePages/index.vue";

defineOptions({ name: "ResumePage" });

const resumeStore = useResumeStore();
const { currentData, currentConfig, currentUI, currentFixedConfig } = storeToRefs(resumeStore);
const acceptModule = inject("acceptModule", () => {});
const rejectModule = inject("rejectModule", () => {});

// 组装可复用组件所需的简历项
const resumeItem = computed(() => ({
  data: currentData.value,
  config: currentConfig.value,
  fixedConfig: currentFixedConfig.value,
  ui: currentUI.value,
}));
</script>

<template>
  <ResumePages :item="resumeItem">
    <template #moduleActions="{ slice }">
      <ModuleActions
        :modelKey="slice.moduleKey"
        @accept="acceptModule(slice.moduleKey)"
        @discard="rejectModule(slice.moduleKey)"
      />
    </template>
  </ResumePages>
</template>

<style scoped></style>
