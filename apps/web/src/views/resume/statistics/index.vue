<script setup>
// 简历情况统计模块：求职进度看板
import { useResumeStatisticsStore } from "@/stores";
import { storeToRefs } from "pinia";
import ApplicationList from "./applicationList/index.vue";
import StatCards from "./components/statCards.vue";
import TrendChart from "./components/trendChart.vue";

const statisticsStore = useResumeStatisticsStore();
const { applications, followUps } = storeToRefs(statisticsStore);
</script>

<template>
  <div class="relative z-4 mx-auto flex w-[1120px] flex-col gap-4 pb-4">
    <div class="flex h-8 items-center gap-3">
      <h2 class="text-[20px] font-black text-sf-theme">简历情况统计</h2>
      <div>{{ $t("router.resumeStatisticsDesc") }}</div>
    </div>
    <StatCards v-if="applications.length || followUps.length" />
    <ApplicationList />

    <TrendChart v-if="applications.length || followUps.length" />
  </div>
</template>

<style lang="scss" scoped></style>
