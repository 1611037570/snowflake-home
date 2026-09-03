<template>
  <!-- 项目运行时间卡片 -->
  <div class="px-3 text-center">
    <div class="mb-3 flex items-center justify-center text-base font-medium text-sf-text">
      已运行

      <p class="px-2 text-2xl font-bold text-sf-theme">
        {{ runTimeDescription }}
      </p>
    </div>
    <div class="inline-flex py-1 text-sm text-sf-text">自 {{ startTime }} 以来</div>
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
  const start = dayjs(startTime);
  const now = dayjs();

  const years = now.diff(start, "year");
  const months = now.diff(start.add(years, "year"), "month");
  const days = now.diff(start.add(years, "year").add(months, "month"), "day");
  let description = `${runDays.value}天`;

  // 如果超过一年，显示更详细的信息
  if (years > 0) {
    description += `（${years}年${months}个月${days}天）`;
  } else if (months > 0) {
    description += `（${months}个月${days}天）`;
  }

  return description;
});
</script>
