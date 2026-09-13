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
    class="star-track-landed relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-sf-b bg-sf-primary p-16 text-center shadow-sm"
  >
    <div
      class="relative z-10 flex h-18 w-18 items-center justify-center rounded-full bg-sf-bg-2 text-sf-theme"
    >
      <SfIcon icon="lucide:star" size="9" />
    </div>
    <span class="relative z-10 rounded-full bg-sf-bg-2 px-3 py-1 text-xs font-bold text-sf-theme"
      >星轨抵达</span
    >
    <h3 class="relative z-10 text-2xl font-black text-sf-theme">恭喜抵达新星</h3>
    <p v-if="landDate" class="relative z-10 text-sm text-sf-text-2">抵达日期：{{ landDate }}</p>
    <p class="relative z-10 text-sm text-sf-text-2">每一段坚持都没有被辜负，愿新的旅程明亮顺遂</p>
    <el-button class="relative z-10" type="primary" @click="handleRestart">开启新的星轨</el-button>
  </div>
</template>

<style lang="scss" scoped>
.star-track-landed::before,
.star-track-landed::after {
  position: absolute;
  border: 1px solid var(--sf-border);
  border-radius: 9999px;
  content: "";
}

.star-track-landed::before {
  top: -9rem;
  left: -6rem;
  width: 18rem;
  height: 18rem;
}

.star-track-landed::after {
  right: -4rem;
  bottom: -6rem;
  width: 14rem;
  height: 14rem;
}
</style>
