<template>
  <div class="mx-auto max-w-2xl p-6">
    <div class="mb-4 text-2xl font-bold text-blue-600" @click="goMe">小羊</div>
    <!-- 项目运行时间卡片 -->
    <div
      class="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-6 text-center shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <h3 class="mb-2 text-lg font-medium text-blue-600">项目已运行</h3>
      <p
        class="text-2xl font-bold text-blue-600 transition-colors duration-200 hover:text-blue-700"
      >
        {{ runTimeDescription }}
      </p>
      <div class="mt-3 text-sm text-blue-500">自 {{ startTime }} 以来</div>
    </div>

    <!-- 项目历程标题 -->
    <h4 class="mb-5 text-lg font-medium text-blue-600">项目发展历程</h4>

    <!-- 项目历程时间线 -->
    <div class="relative">
      <!-- 时间线垂直轴 -->
      <div class="absolute top-0 bottom-0 left-4 w-px bg-blue-100"></div>

      <!-- 时间线条目 -->
      <div v-for="item in historyList" :key="item.time" class="group relative ml-12">
        <!-- 时间线圆点 -->
        <div class="absolute -left-12 mt-1.5 flex items-center justify-center">
          <div
            class="h-8 w-8 rounded-full border-4 border-white bg-blue-500 shadow-sm transition-transform duration-200 group-hover:scale-110"
          ></div>
        </div>

        <!-- 时间戳 -->
        <div class="group mb-2 pt-1">
          <div
            class="text-lg font-semibold text-blue-600 transition-colors duration-200 group-hover:text-blue-700"
          >
            {{ item.time }}
          </div>
        </div>

        <!-- 描述内容 -->
        <div
          class="rounded-lg border border-blue-50 bg-white p-4 shadow-sm transition-all duration-300 group-hover:border-blue-200"
        >
          <div class="mb-2 last:mb-0">
            <div class="flex items-center">
              <span class="text-gray-600 transition-colors duration-200 hover:text-blue-600">{{
                item.desc
              }}</span>
            </div>
          </div>

          <!-- 图片展示 -->
          <div v-if="item.img" class="mt-4">
            <SfImg
              :src="item.img"
              class="mx-auto w-full max-w-md cursor-pointer rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg"
              :preview-src-list="item.img"
              fit="contain"
              lazy
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { urlNavigation } from "@/utils";
import dayjs from "dayjs";
import { historyList } from "@/configs/modules/history";

function goMe() {
  urlNavigation("/index");
}

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
