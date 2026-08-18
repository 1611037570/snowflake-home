<template>
  <div
    class="w-dwh relative z-10 flex flex-col overflow-hidden bg-sf-primary px-12 py-36"
    id="history"
  >
    <!-- 标题区域 -->
    <div class="mb-10 flex flex-col items-center space-y-2 px-4">
      <h2 class="text-3xl font-bold text-sf-text">时光轴</h2>
      <p class="text-sf-text-2">记录每一个重要的时刻与里程碑</p>
    </div>

    <el-scrollbar class="relative mx-auto max-w-[1200px]">
      <!-- 左侧边缘虚化 -->
      <div
        class="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-26 bg-linear-to-r from-[var(--sf-primary)] to-transparent"
      ></div>
      <!-- 右侧边缘虚化 -->
      <div
        class="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-26 bg-linear-to-l from-[var(--sf-primary)] to-transparent"
      ></div>
      <div class="flex flex-row items-start gap-8 px-4 pt-4 pb-12">
        <div
          v-for="(item, index) in historyList"
          :key="item.time"
          class="group relative flex w-[320px] flex-shrink-0 flex-col"
        >
          <!-- 顶部时间 -->
          <div class="mb-4 flex items-center">
            <span class="text-lg font-bold text-sf-theme">{{ formatTime(item.time) }}</span>
          </div>

          <!-- 时间轴连接线与节点 -->
          <div class="relative mb-6 flex items-center">
            <!-- 节点 -->
            <div
              class="z-10 h-4 w-4 rounded-full border-[3px] border-sf-bg bg-sf-theme transition-transform duration-300 group-hover:scale-125"
            ></div>
            <!-- 连接线 (除了最后一个元素) -->
            <div
              v-if="index !== historyList.length - 1"
              class="absolute top-1/2 left-4 h-[2px] w-[calc(100%+32px)] -translate-y-1/2 bg-sf-border"
            ></div>
          </div>

          <!-- 内容卡片 -->
          <div
            class="flex h-full flex-col overflow-hidden rounded-xl border border-sf-border/50 bg-sf-bg-2 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <!-- 文字描述 -->
            <div class="flex flex-1 flex-col justify-between">
              <p class="text-sm leading-relaxed text-sf-text-2">
                {{ item.desc }}
              </p>
            </div>
          </div>
        </div>

        <!-- 结尾占位，确保最后一个元素右侧有留白 -->
        <div class="w-8 flex-shrink-0"></div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { historyList } from "@/configs";

// 简单的日期格式化，如果 time 是时间戳
const formatTime = (time: string | number) => {
  if (typeof time === "number") {
    // 假设是时间戳，这里简单处理，或者直接返回
    // 如果是 '未完待续' 这种字符串，直接返回
    return new Date(time).toLocaleDateString();
  }
  return time;
};
</script>

<style lang="scss" scoped>
/* 隐藏滚动条但保留功能 (可选) */
:deep(.el-scrollbar__bar.is-horizontal) {
  height: 6px;
  bottom: 2px;
}
</style>
