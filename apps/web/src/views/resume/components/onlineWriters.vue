<script setup>
import { onMounted, ref } from "vue";
import { TransitionPresets, useTransition } from "@vueuse/core";
import { getRandom } from "@/utils";
import { $t } from "@/locales";

const props = defineProps({
  /** 紧凑模式：只显示图标与人数，完整文案放进悬停提示，供窄栏使用 */
  compact: { type: Boolean, default: false },
});

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
  <!-- 紧凑模式：工具轨等窄容器只显示人数，完整文案悬停可见 -->
  <SfTooltip
    v-if="props.compact"
    :content="$t('resumeOnlineWriters', { count: Math.round(displayCount) })"
  >
    <span class="flex w-10 flex-col items-center gap-0.5 pt-1.5 text-sf-text-2">
      <SfIcon icon="mdi:account-group-outline" size="4" />
      <span class="text-[11px] leading-none">{{ Math.round(displayCount) }}</span>
      <span class="text-[9px] leading-none text-sf-text-3">{{ $t("resumeOnline") }}</span>
    </span>
  </SfTooltip>
  <p v-else class="text-xs text-sf-text-2">
    {{ $t("resumeOnlineWriters", { count: Math.round(displayCount) }) }}
  </p>
</template>
