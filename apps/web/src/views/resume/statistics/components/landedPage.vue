<script setup>
// 上岸后展示页面：恭喜上岸，支持清空数据并重新开始记录
import { useResumeStatisticsStore } from "@/stores";
import { storeToRefs } from "pinia";

const statisticsStore = useResumeStatisticsStore();
const { landDate } = storeToRefs(statisticsStore);

// 清空数据并重新开始（需二次确认）
const handleRestart = () => {
  ElMessageBox.confirm("清空后所有投递与跟进记录将无法恢复，确定重新开始记录吗？", "重新开始记录", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
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
    <h3 class="text-2xl font-black text-sf-theme">恭喜上岸</h3>
    <p v-if="landDate" class="text-sm text-sf-text-2">上岸日期：{{ landDate }}</p>
    <p class="text-sm text-sf-text-2">求职之旅圆满结束，愿新工作一切顺利</p>
    <el-button type="primary" @click="handleRestart">清空数据，重新开始记录</el-button>
  </div>
</template>

<style lang="scss" scoped></style>
