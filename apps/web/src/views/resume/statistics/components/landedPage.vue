<script setup>
// 上岸后展示页面：恭喜上岸，支持清空数据并重新开始记录
import { useResumeStatisticsStore } from "@/stores";
import { storeToRefs } from "pinia";
import { $t } from "@/locales";

const statisticsStore = useResumeStatisticsStore();
const { landDate } = storeToRefs(statisticsStore);

// 清空数据并重新开始（需二次确认）
const handleRestart = () => {
  ElMessageBox.confirm($t("resumeStatisticsRestartMessage"), $t("resumeStatisticsRestart"), {
    confirmButtonText: $t("resumeStatisticsConfirm"),
    cancelButtonText: $t("resumeStatisticsCancel"),
    type: "warning",
  }).then(() => {
    statisticsStore.restart();
  });
};
</script>

<template>
  <div
    class="border-sf-b flex flex-col items-center gap-4 rounded-xl border bg-sf-primary p-16 text-center shadow-sm"
  >
    <div class="text-sf-theme">
      <SfIcon icon="lucide:party-popper" size="12" />
    </div>
    <h3 class="text-2xl font-black text-sf-theme">{{ $t("resumeStatisticsLandedTitle") }}</h3>
    <p v-if="landDate" class="text-sm text-sf-text-2">{{ $t("resumeStatisticsLandedDate") }}{{ landDate }}</p>
    <p class="text-sm text-sf-text-2">{{ $t("resumeStatisticsLandedDescription") }}</p>
    <el-button type="primary" @click="handleRestart">{{ $t("resumeStatisticsRestartAction") }}</el-button>
  </div>
</template>

<style lang="scss" scoped></style>
