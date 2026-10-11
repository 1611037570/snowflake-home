<script setup>
import { onMounted, ref } from "vue";
import { TransitionPresets, useTransition } from "@vueuse/core";
import { getRandom } from "@/utils";

// 在线人数：进入页面时抽取一次（10~200），营造共同写作的氛围，不依赖后端
const onlineCount = ref(0);
// 与首屏指标一致的滚动效果：数字从 0 平滑增长到目标值
const displayCount = useTransition(onlineCount, {
  duration: 1500,
  transition: TransitionPresets.easeOutCubic,
});

onMounted(() => {
  onlineCount.value = getRandom(10, 200);
});
</script>

<template>
  <p class="text-xs text-sf-text-2">
    {{ $t("resumeOnlineWriters", { count: Math.round(displayCount) }) }}
  </p>
</template>
