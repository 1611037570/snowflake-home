<script setup>
// 简历情况统计模块：求职进度看板
import { useResumeStatisticsStore } from "@/stores";
import { storeToRefs } from "pinia";
import ApplicationList from "./components/applicationList.vue";
import StatCards from "./components/statCards.vue";
import TrendChart from "./components/trendChart.vue";

const statisticsStore = useResumeStatisticsStore();
const { applications } = storeToRefs(statisticsStore);
</script>

<template>
  <div class="relative z-4 mx-auto flex w-[1120px] flex-col gap-4">
    <div class="flex h-8 items-center gap-3">
      <h2 class="text-[20px] font-black text-sf-theme">简历情况统计</h2>
      <div>{{ $t("router.resumeStatisticsDesc") }}</div>
    </div>
    <template v-if="applications.length">
      <StatCards />
      <TrendChart />
    </template>
    <div
      v-else
      class="flex flex-col items-center gap-4 rounded-xl border border-sf-border bg-sf-primary p-10 shadow-sm"
    >
      <div class="text-sf-text-2">
        <SfIcon icon="lucide:inbox" size="10" />
      </div>
      <p class="text-sm text-sf-text-2">开始记录你的第一条投递吧</p>
      <div class="flex items-center gap-3">
        <el-button type="primary" @click="applicationListRef.openAdd()">新建一条</el-button>
        <el-button @click="applicationListRef.openBatch()">批量添加</el-button>
      </div>
    </div>
    <div v-show="applications.length">
      <ApplicationList ref="applicationListRef" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
