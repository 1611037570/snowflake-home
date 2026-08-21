<script setup>
// 投递趋势：折线图展示最近 7 天或当月每天的投递数量，可切换
import { useResumeStatisticsStore } from "@/stores";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const statisticsStore = useResumeStatisticsStore();
const { applications } = storeToRefs(statisticsStore);

// 图表模式：week-近 7 天，month-当月
const mode = ref("week");
// 图表展示日期（week：近 7 天含今天，month：当月每天）
const days = computed(() =>
  mode.value === "week"
    ? Array.from({ length: 7 }, (_, i) =>
        dayjs()
          .subtract(6 - i, "day")
          .format("YYYY-MM-DD"),
      )
    : Array.from({ length: dayjs().daysInMonth() }, (_, i) =>
        dayjs()
          .date(i + 1)
          .format("YYYY-MM-DD"),
      ),
);
// 每天的投递数量
const counts = computed(() => days.value.map((d) => applications.value.filter((item) => item.date === d).length));
// 图表配置
const options = computed(() => ({
  title: {
    text: mode.value === "week" ? "近七天投递趋势" : "本月投递趋势",
  },
  xAxis: {
    type: "category",
    data: days.value.map((d) => dayjs(d).format(mode.value === "week" ? "MM-DD" : "DD")),
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
    <div class="mb-3">
      <el-radio-group v-model="mode">
        <el-radio-button value="week">近7天</el-radio-button>
        <el-radio-button value="month">本月</el-radio-button>
      </el-radio-group>
    </div>
    <SfEcharts class="h-80" :options="options" />
  </div>
</template>

<style lang="scss" scoped></style>
