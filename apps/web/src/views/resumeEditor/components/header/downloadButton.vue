<script setup>
import { useResumeStore } from "@/stores";
import eventBus from "@/utils/modules/eventBus";
import { storeToRefs } from "pinia";

const resumeStore = useResumeStore();
const { isPrinting } = storeToRefs(resumeStore);

// 点击下载：触发简历 PDF 生成
const handleDownload = () => {
  if (isPrinting.value) return;
  eventBus.emit("resume-print-pdf");
};
</script>

<template>
  <el-button
    @click="handleDownload"
    :loading="isPrinting"
    class="!h-9 !rounded-lg !border-sf-b !bg-sf-primary !px-4 !font-medium !text-sf-text-2 hover:!border-sf-theme hover:!text-sf-theme"
  >
    <template #icon v-if="!isPrinting">
      <SfIcon icon="material-symbols:download" size="4.5" class="mr-1" />
    </template>
    {{ isPrinting ? "生成中..." : "下载" }}
  </el-button>
</template>

<style lang="scss" scoped>
:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
