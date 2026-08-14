<template>
  <div
    class="group h-10 w-10 cursor-pointer rounded-lg bg-white/80 transition-all duration-200"
    @click="switchTab"
  >
    <!-- 多彩3x3圆点网格 -->
    <div class="grid h-full w-full grid-cols-3 place-items-center gap-0.5 p-1.5">
      <div class="h-2 w-2 rounded-[1.5px] bg-red-500"></div>
      <div class="h-2 w-2 rounded-[1.5px] bg-orange-500"></div>
      <div class="h-2 w-2 rounded-[1.5px] bg-yellow-500"></div>
      <div class="h-2 w-2 rounded-[1.5px] bg-green-500"></div>
      <div class="h-2 w-2 rounded-[1.5px] bg-blue-500"></div>
      <div class="h-2 w-2 rounded-[1.5px] bg-indigo-500"></div>
      <div class="h-2 w-2 rounded-[1.5px] bg-purple-500"></div>
      <div class="h-2 w-2 rounded-[1.5px] bg-teal-500"></div>
      <div class="h-2 w-2 rounded-[1.5px] bg-pink-500"></div>
      <div
        v-if="tabIndex === 1"
        class="absolute -bottom-[7px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-[1.5px] bg-sf-primary"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { useHomeStore } from "@/stores";
const homeStore = useHomeStore();
const { switchTab } = homeStore;
const { tabIndex } = storeToRefs(homeStore);
</script>

<style scoped></style>
