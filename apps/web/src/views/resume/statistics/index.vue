<script setup>
// 简历情况统计模块：求职进度看板
import { useResumeStatisticsStore } from "@/stores";
import { storeToRefs } from "pinia";
import ApplicationList from "./applicationList/index.vue";
import StatCards from "./components/statCards.vue";
import TrendChart from "./components/trendChart.vue";
import LandedPage from "./components/landedPage.vue";

const statisticsStore = useResumeStatisticsStore();
const { applications, followUps, isLanded } = storeToRefs(statisticsStore);
</script>

<template>
  <div class="relative mx-auto flex h-full w-full max-w-7xl flex-col gap-3">
    <div class="mt-2 flex w-full min-w-full items-center justify-between px-6">
      <h2 class="text-[20px] font-black text-sf-theme">简历情况统计</h2>
    </div>
    <SfScrollbar class="flex-1">
      <div class="flex h-full flex-col gap-3 py-1">
        <LandedPage v-if="isLanded" />
        <template v-else>
          <StatCards v-if="applications.length || followUps.length" />
          <ApplicationList />

          <TrendChart v-if="applications.length || followUps.length" />
        </template>
        <div class="flex flex-1 flex-col items-center justify-end">
          <SfFooter />
        </div>
      </div>
    </SfScrollbar>
  </div>
</template>

<style lang="scss" scoped></style>
