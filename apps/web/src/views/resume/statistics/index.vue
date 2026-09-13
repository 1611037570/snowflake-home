<script setup>
// 简历情况统计模块：求职进度看板
import { useResumeStatisticsStore } from "@/stores";
import { storeToRefs } from "pinia";
import ApplicationList from "./applicationList/index.vue";
import StatCards from "./components/statCards.vue";
import TrendChart from "./components/trendChart.vue";
import LandedPage from "./components/landedPage.vue";

const statisticsStore = useResumeStatisticsStore();
const { applications, followUps, isLanded, totalApplications } = storeToRefs(statisticsStore);
</script>

<template>
  <div class="relative mx-auto flex h-full w-full max-w-7xl flex-col gap-3">
    <div
      class="star-track-header relative mt-3 flex w-full min-w-full items-center justify-between overflow-hidden rounded-2xl border border-sf-b bg-sf-primary px-6 py-3"
    >
      <div class="relative z-10 flex items-center gap-3">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-2xl bg-sf-bg-2 text-sf-theme"
        >
          <SfIcon icon="lucide:orbit" size="6" />
        </div>
        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-[20px] font-black tracking-wide text-sf-theme">星轨统计</h2>
            <span class="rounded-full bg-sf-bg-2 px-3 py-1 text-xs font-bold text-sf-text-2">
              星轨为证 功不唐捐
            </span>
          </div>
          <p class="mt-1 text-xs text-sf-text-2">记录每一次投递，让机会沿着清晰的轨迹前行</p>
        </div>
      </div>
      <div class="relative z-10 hidden items-center gap-3 text-right sm:flex">
        <div>
          <p class="text-xs text-sf-text-2">已捕捉机会坐标</p>
          <p class="text-lg font-black text-sf-theme">
            {{ totalApplications }} <span class="text-xs">个</span>
          </p>
        </div>
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full border border-sf-b bg-sf-bg-2 text-sf-theme"
        >
          <SfIcon icon="lucide:star" size="5" />
        </div>
      </div>
    </div>
    <SfScrollbar class="flex-1">
      <div class="flex h-full flex-col gap-3 py-3">
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

<style lang="scss" scoped>
.star-track-header::after {
  position: absolute;
  top: -5rem;
  right: 6rem;
  width: 12rem;
  height: 12rem;
  border: 1px solid var(--sf-border);
  border-radius: 9999px;
  content: "";
}

.star-track-header::before {
  position: absolute;
  top: 1.5rem;
  right: 12rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: var(--sf-theme);
  box-shadow:
    3rem 2rem 0 var(--sf-theme),
    6rem -1rem 0 var(--sf-theme);
  content: "";
}
</style>
