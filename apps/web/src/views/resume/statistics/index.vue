<script setup>
// 简历情况统计模块：求职进度看板
import ApplicationList from "./components/applicationList.vue";
import StatCards from "./components/statCards.vue";
import TrendChart from "./components/trendChart.vue";
</script>

<template>
  <div class="relative z-4 mx-auto flex w-[1120px] flex-col gap-4">
    <div class="flex h-8 items-center justify-between">
      <h2 class="text-[20px] font-black text-sf-theme">简历情况统计</h2>
    </div>
    <StatCards />
    <TrendChart />
    <ApplicationList />
  </div>
</template>

<style lang="scss" scoped></style>
