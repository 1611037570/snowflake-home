<script setup>
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { useProgress } from "../../../hooks/useProgress";
import { jumpToEditor } from "../../../hooks/useModuleNav";
import { TransitionPresets, useTransition } from "@vueuse/core";
import { computed, ref } from "vue";
import { useResumeStats } from "./useResumeStats";
import { $t } from "@/locales";

const resumeStore = useResumeStore();
const { system, currentData, runtimeFields } = storeToRefs(resumeStore);

// 弹窗显隐控制
const visible = ref(false);

// 计算简历完成度进度及各模块进度（含时间线一致性检查结果）
const progressData = computed(() => useProgress(runtimeFields.value || [], currentData.value));
const resumeStats = useResumeStats(currentData.value);
// 时间线一致性检查结果（随进度一起返回）
const timelineData = computed(() => progressData.value.timeline);

// 按模块 key 聚合时间线问题，供模块进度卡片内联展示
const timelineByModule = computed(() => {
  const map = {};
  timelineData.value.list.forEach((module) => {
    map[module.key] = module.issues;
  });
  return map;
});

// 总进度数字过渡动画
const animatedProgress = useTransition(
  computed(() => progressData.value.progress),
  {
    duration: 500,
    transition: TransitionPresets.easeOutCubic,
  },
);

// 弹窗外提示文案：时间线存在问题时提醒
const tooltipText = computed(() =>
  timelineData.value.issueCount
    ? $t("timelineIssue", { count: timelineData.value.issueCount })
    : $t("viewProgressDetail"),
);

// 跳转编辑对应模块：复用模块导航的编辑区跳转逻辑（不处理预览区）
const goFill = (item) => {
  jumpToEditor(item.key);
  visible.value = false;
};

// 跳转编辑时间线问题模块
const goTimelineFill = (key) => {
  jumpToEditor(key);
  visible.value = false;
};

// 时间线问题类型标签（仅保留间隙过大）
const getTypeLabel = () => $t("issueGap");

// 按进度区间返回进度条颜色
const getProgressColor = (progress) => {
  if (progress >= 80) return "bg-sf-success";
  if (progress >= 50) return "bg-sf-theme";
  if (progress >= 30) return "bg-sf-warning";
  return "bg-sf-error";
};
</script>

<template>
  <SfTooltip v-if="system.showProgress" :content="tooltipText" placement="left">
    <button
      type="button"
      class="flex h-9 w-12 shrink-0 cursor-pointer items-center justify-center text-sf-text-2 transition-colors hover:text-sf-theme"
      @click="visible = true"
    >
      <div class="relative h-9 w-9">
        <svg class="h-9 w-9 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
          <circle
            cx="24"
            cy="24"
            r="19"
            fill="none"
            stroke="currentColor"
            class="text-sf-bg-2"
            stroke-width="5"
          />
          <circle
            cx="24"
            cy="24"
            r="19"
            fill="none"
            stroke="currentColor"
            class="text-sf-success"
            stroke-width="5"
            stroke-linecap="round"
            stroke-dasharray="119.38"
            :stroke-dashoffset="119.38 - (119.38 * Math.round(animatedProgress)) / 100"
          />
        </svg>
        <span class="absolute inset-0 grid place-content-center text-xs font-bold text-sf-text">
          {{ Math.round(animatedProgress) }}
        </span>
      </div>
    </button>
  </SfTooltip>

  <SfModal v-model="visible" :title="$t('progressDetail')">
    <div class="flex w-[400px] flex-col gap-1.5">
      <p class="mb-2 text-sm text-sf-text-2">{{ $t("atsScoreDisclaimer") }}</p>
      <!-- 列表过长时在滚动区域内查看。 -->
      <SfScrollbar max-height="400px">
        <template v-for="item in progressData.list" :key="item.key">
          <div class="rounded-3xl border border-sf-b p-3">
            <div class="flex items-center justify-between">
              <div class="text-lg">
                {{ item.name }}
                <span class="text-sm text-sf-text-2">
                  {{ $t("writingWords", { count: resumeStats[item.key]?.total ?? 0 }) }}
                </span>
              </div>
              <div class="text-lg font-bold">{{ item.progress }}%</div>
            </div>
            <div class="mt-2 h-2 w-full rounded-full bg-sf-bg-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="getProgressColor(item.progress)"
                :style="{ width: item.progress + '%' }"
              ></div>
            </div>
            <div
              v-if="item.issues.length"
              class="mt-2 flex flex-col gap-1 rounded-xl bg-sf-warning-2 p-2 text-sm text-sf-warning"
            >
              <div class="font-medium">{{ $t("formatIssues") }}</div>
              <div v-for="(issue, index) in item.issues" :key="index">
                {{ issue.label }}：{{ issue.message }}
              </div>
            </div>
            <!-- 模块时间线问题：存在时内联展示 -->
            <div
              v-if="timelineByModule[item.key]"
              class="mt-2 flex flex-col gap-1 rounded-xl bg-sf-bg-2 p-2"
            >
              <div
                v-for="(issue, index) in timelineByModule[item.key]"
                :key="index"
                class="flex items-start gap-2 text-sm"
              >
                <span
                  class="shrink-0 rounded-full bg-sf-warning-2 px-2 py-0.5 text-xs text-sf-warning"
                >
                  {{ getTypeLabel() }}
                </span>
                <span class="text-sf-text">{{ issue.text }}</span>
              </div>
              <div class="cursor-pointer text-sm text-sf-theme" @click="goTimelineFill(item.key)">
                {{ $t("modify") }}
              </div>
            </div>
            <template v-if="item.progress < 100">
              <div class="mt-2 flex flex-wrap gap-1 text-xs text-sf-text-2">
                <span
                  v-for="(field, index) in item.missing"
                  :key="index"
                  class="rounded-full bg-sf-bg-2 px-2 py-0.5"
                >
                  {{ $t("missingPrefix") }}{{ field }}
                </span>
              </div>
              <div class="mt-2 cursor-pointer text-sm text-sf-theme" @click="goFill(item)">
                {{ $t("fillIn") }}
              </div>
            </template>
          </div>
        </template>
      </SfScrollbar>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
