<script setup>
// 简历情况统计模块：求职进度看板
import { useResumeStatisticsStore } from "@/stores";
import { storeToRefs } from "pinia";
import ApplicationList from "./applicationList/index.vue";
import StatCards from "./components/statCards.vue";
import TrendChart from "./components/trendChart.vue";
import LandedPage from "./components/landedPage.vue";
import PublicContent from "../seo/publicContent.vue";

const statisticsStore = useResumeStatisticsStore();
const { applications, followUps, isLanded } = storeToRefs(statisticsStore);
</script>

<template>
  <div class="relative mx-auto flex h-full w-full max-w-7xl flex-col gap-3">
    <div class="mt-2 flex w-full min-w-0 items-center justify-between px-3 sm:px-6">
      <h2 class="text-[20px] font-black text-sf-theme">{{ $t("resumeStatisticsTitle") }}</h2>
    </div>
    <SfScrollbar class="flex-1" flush>
      <div class="flex h-full flex-col gap-3 px-3 py-1">
        <LandedPage v-if="isLanded" />
        <template v-else>
          <StatCards v-if="applications.length || followUps.length" />
          <ApplicationList />

          <TrendChart v-if="applications.length || followUps.length" />
        </template>
        <!-- 静态说明与构建正文共用内容，不读取个人投递记录。 -->
        <PublicContent class="shrink-0" />
      </div>
    </SfScrollbar>
  </div>
</template>

<style lang="scss" scoped></style>
