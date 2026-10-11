<script setup>
// 站点统计：首屏底部展示累计访客与简历生成量
import { getStatsOverview } from "@/apis";
import { $t } from "@/locales";
import { computed, onMounted, ref } from "vue";

// 统计概览数据，加载失败时保持为空，数字位显示占位符
const overview = ref(null);

onMounted(async () => {
  try {
    overview.value = await getStatsOverview();
  } catch {
    overview.value = null;
  }
});

// 首屏指标：累计访客与简历生成量（新建与导入合计），未取到数据显示占位符
const metrics = computed(() => {
  const actions = overview.value?.actions;
  const resumes = actions ? (actions.create ?? 0) + (actions.import ?? 0) : null;
  return [
    {
      key: "totalVisitors",
      label: $t("resumeSiteStatsTotalVisitors"),
      value: overview.value?.visitors?.totalUsers ?? "–",
      unit: $t("resumeSiteStatsUnitPeople"),
    },
    {
      key: "resumeActions",
      label: $t("resumeSiteStatsResumeActions"),
      value: resumes ?? "–",
      unit: $t("resumeSiteStatsUnitTimes"),
    },
  ];
});
</script>

<template>
  <div
    class="flex flex-col justify-between gap-9 border-t border-sf-b pt-9 md:flex-row md:items-end lg:col-span-2 lg:self-end"
  >
    <div class="max-w-md">
      <p class="text-sm font-semibold tracking-[0.18em] text-sf-theme">
        {{ $t("resumeSiteStatsEyebrow") }}
      </p>
      <h2 class="mt-3 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
        {{ $t("resumeSiteStatsTitle") }}
      </h2>
    </div>
    <div class="flex gap-12">
      <div v-for="metric in metrics" :key="metric.key">
        <p class="flex items-end gap-1 text-3xl font-black text-sf-theme sm:text-4xl">
          {{ metric.value }}
          <small class="mb-1 text-sm font-medium text-sf-text-2">{{ metric.unit }}</small>
        </p>
        <p class="mt-3 text-sm text-sf-text-3">{{ metric.label }}</p>
      </div>
    </div>
  </div>
</template>
