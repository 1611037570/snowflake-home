<script setup>
// 简历情况统计模块：求职进度看板
import ApplicationList from "./components/applicationList.vue";
import StatCards from "./components/statCards.vue";
import TrendChart from "./components/trendChart.vue";
</script>

<template>
  <div class="relative z-4 mx-auto flex w-[1120px] flex-col gap-4">
    <StatCards />
    <TrendChart />
    <ApplicationList />
  </div>
</template>

<style lang="scss" scoped></style>
