<script setup>
// 近七天投递趋势：折线图展示最近 7 天每天的投递数量
import { useResumeStatisticsStore } from "@/stores";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";

const statisticsStore = useResumeStatisticsStore();
const { applications } = storeToRefs(statisticsStore);

// 近 7 天日期（含今天，从早到晚）
const days = computed(() =>
  Array.from({ length: 7 }, (_, i) => dayjs().subtract(6 - i, "day").format("YYYY-MM-DD")),
);
// 每天的投递数量
const counts = computed(() =>
  days.value.map((d) => applications.value.filter((item) => item.date === d).length),
);
// 图表配置
const options = computed(() => ({
  title: {
    text: "近七天投递趋势",
  },
  xAxis: {
    type: "category",
    data: days.value.map((d) => dayjs(d).format("MM-DD")),
  },
  yAxis: {
    type: "value",
    minInterval: 1,
  },
  series: [
    {
      type: "line",
      name: "投递数",
      data: counts.value,
      smooth: true,
      areaStyle: {},
    },
  ],
}));
</script>

<template>
  <div class="rounded-xl border border-sf-border bg-sf-primary p-4 shadow-sm">
    <SfEcharts :options="options" />
  </div>
</template>

<style lang="scss" scoped></style>
