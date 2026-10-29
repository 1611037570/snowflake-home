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
    <div class="mt-3 flex w-full min-w-0 items-center justify-between px-3">
      <h1 class="text-lg font-semibold text-sf-text">{{ $t("resumeStatisticsTitle") }}</h1>
    </div>
    <SfScrollbar class="flex-1" flush>
      <div class="flex h-full flex-col gap-3 px-3 py-1">
        <LandedPage v-if="isLanded" />
        <template v-else>
          <StatCards v-if="applications.length || followUps.length" />
          <ApplicationList />

          <TrendChart v-if="applications.length || followUps.length" />
        </template>
      </div>
    </SfScrollbar>
  </div>
</template>

<style lang="scss" scoped></style>
