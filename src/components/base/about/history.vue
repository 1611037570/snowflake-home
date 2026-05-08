<script setup>
import { historyList } from './data'
</script>

<template>
  <div class="p-6">
    <h3 class="mb-3 text-center text-base font-medium text-sf-text-2">发展历程</h3>
    <p class="mb-6 text-center text-sm text-sf-text-2">记录每一个重要时刻</p>
    <div class="space-y-4">
      <div v-for="(item, index) in historyList" :key="item.time" class="group relative pl-6">
        <div
          v-if="index !== historyList.length - 1"
          class="absolute top-5 left-[5px] h-full w-px bg-sf-border"
        ></div>
        <div
          class="absolute top-5 left-0 z-1 h-2.5 w-2.5 rounded-full bg-sf-theme transition-transform duration-200 group-hover:scale-125"
        ></div>
        <div
          class="rounded-lg bg-sf-bg-hover p-4 transition-colors duration-200 group-hover:bg-sf-theme/10"
        >
          <div class="mb-3 inline-flex rounded-full bg-sf-theme/10 px-3 py-1 text-sm text-sf-theme">
            {{ item.time }}
          </div>
          <SfImg v-if="item.img" :src="item.img" class="mb-3 h-32 w-full rounded-lg object-cover" />
          <p class="text-sm leading-6 text-sf-text-2">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
