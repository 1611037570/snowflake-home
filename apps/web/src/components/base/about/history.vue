<script setup>
import { historyList } from "@/constants/modules/history";
</script>

<template>
  <div class="px-6">
    <p class="mt-3 mb-6 text-center text-sm text-sf-text-2">记录每一个重要时刻</p>
    <div class="space-y-4">
      <div v-for="(item, index) in historyList" :key="item.time" class="group relative pl-6">
        <div class="mb-3 inline-flex rounded-full bg-sf-theme/10 px-3 py-1 text-sm text-sf-theme">
          {{ item.time }}
        </div>
        <div
          v-if="index !== historyList.length - 1"
          class="absolute top-5 left-[5px] h-full w-px bg-sf-border"
        ></div>
        <div
          class="absolute top-5 left-0 z-1 h-2.5 w-2.5 rounded-full bg-sf-theme transition-transform duration-200 group-hover:scale-125"
        ></div>
        <div
          class="rounded-lg bg-sf-bg-hover p-2 transition-colors duration-200 group-hover:bg-sf-theme/10"
        >
          <p class="text-sm leading-6 text-sf-text-2">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
