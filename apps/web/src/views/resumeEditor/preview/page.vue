<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, getCurrentInstance, ref } from "vue";
import ResumePages from "./resumePages/index.vue";
import DeliverResume from "@/views/resume/mine/deliverResume.vue";

defineOptions({ name: "ResumePage" });

const resumeStore = useResumeStore();
const { currentData, currentConfig, currentUI, currentFixedConfig } = storeToRefs(resumeStore);

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
</script>

<template>
  <ResumePages :item="resumeItem" @resume-export-success="onExportSuccess" />
  <DeliverResume ref="deliverResumeRef">
    <span />
  </DeliverResume>
</template>

<style scoped></style>
