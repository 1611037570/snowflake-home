<template>
  <!-- 项目运行时间卡片 -->
  <div class="px-6 text-center">
    <div class="mb-3 flex items-center justify-center text-base font-medium text-sf-text-2">
      已运行

      <p class="px-2 text-4xl font-bold text-sf-theme transition-colors duration-200">
        {{ runTimeDescription }}
      </p>
      天
    </div>
    <div class="inline-flex rounded-full bg-sf-bg-hover px-3 py-1 text-sm text-sf-text-2">
      自 {{ startTime }} 以来
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs";

// 项目开始时间
const startTime = "2020-09-03";

// 计算项目运行天数
const runDays = computed(() => {
  const start = dayjs(startTime);
  const now = dayjs();
  return now.diff(start, "day");
});

// 计算项目运行时间的详细描述
const runTimeDescription = computed(() => {
  const description = `${runDays.value}`;

  return description;
});
</script>
