<script setup>
// 完成度入口：挂在模块树顶部，显示总进度并可打开完成度详情
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { TransitionPresets, useTransition } from "@vueuse/core";
import { useResumeStore } from "@/stores";
import { useProgress } from "../../../../hooks/useProgress";
import { jumpToEditor } from "../../../../hooks/useModuleNav";
import { useResumeStats } from "../../../../hooks/useResumeStats";
import { $t } from "@/locales";

const resumeStore = useResumeStore();
const { currentData, runtimeFields, currentUI } = storeToRefs(resumeStore);

// 详情弹窗显隐
const visible = ref(false);

// 总进度与各模块进度（含时间线一致性检查结果），传入界面配置用于判断双形态模块布局
const progressData = computed(() =>
  useProgress(runtimeFields.value || [], currentData.value, currentUI.value),
);
// 保留数据引用，切换简历及撤销替换数据后重新统计当前内容
const resumeStats = useResumeStats(computed(() => currentData.value || {}));
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
const animatedProgress = useTransition(computed(() => progressData.value.progress), {
  duration: 500,
  transition: TransitionPresets.easeOutCubic,
});

// 缺失字段总数：用于入口第二行提示还差多少项
const missingCount = computed(() =>
  progressData.value.list.reduce((total, item) => total + (item.missing?.length || 0), 0),
);

// 环形进度颜色：存在格式错误时优先警示，其余按阈值取色
const ringColorClass = computed(() => {
  if (progressData.value.hasError) return "text-sf-warning";
  const progress = progressData.value.progress;
  if (progress >= 80) return "text-sf-success";
  if (progress >= 50) return "text-sf-theme";
  if (progress >= 30) return "text-sf-warning";
  return "text-sf-error";
});

// 入口提示：格式错误 > 时间线问题 > 查看详情
const tooltipText = computed(() => {
  if (progressData.value.hasError) return $t("formatIssues");
  return timelineData.value.issueCount
    ? $t("timelineIssue", { count: timelineData.value.issueCount })
    : $t("viewProgressDetail");
});

// 跳转编辑对应模块：复用模块导航的编辑区跳转逻辑（不处理预览区）
const goFill = (item) => {
  jumpToEditor(item.key);
  visible.value = false;
};

// 时间线仍会返回日期冲突与未来日期，按真实问题类型展示标签
const getTypeLabel = (issue) =>
  $t(
    {
      // 经历之间的时间空档
      gap: "issueGap",
      // 开始与结束时间冲突
      range: "issueRange",
      // 超出当前日期
      future: "issueFuture",
    }[issue.type] || "issueGap",
  );

// 按进度区间返回进度条颜色
const getProgressColor = (progress) => {
  if (progress >= 80) return "bg-sf-success";
  if (progress >= 50) return "bg-sf-theme";
  if (progress >= 30) return "bg-sf-warning";
  return "bg-sf-error";
};

// 待处理项：格式问题置顶，其次缺失字段，最后时间线问题
const getTodoList = (item) => [
  ...(item.issues || []).map((issue) => `${issue.label}：${issue.message}`),
  ...(item.missing || []).map((field) => `${$t("missingPrefix")}${field}`),
  ...(timelineByModule.value[item.key] || []).map(
    (issue) => `${getTypeLabel(issue)}：${issue.text}`,
  ),
];
</script>

<template>
  <!-- 完成度固定在模块列表上方：自身承担下边距与分隔线，避免依赖外部类 -->
  <SfTooltip
    :content="tooltipText"
    placement="right"
    class="mb-1.5 block w-full shrink-0 border-b border-sf-b pb-1.5"
  >
    <button
      type="button"
      class="relative flex w-full cursor-pointer items-center gap-1.5 rounded-3xl px-1 py-1.5 text-left transition-colors hover:bg-sf-bg max-md:justify-center"
      :aria-label="$t('progressDetail')"
      @click="visible = true"
    >
      <!-- 环形进度：窄屏只保留这一圈 -->
      <span class="relative h-7 w-7 shrink-0">
        <svg class="h-7 w-7 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
          <circle
            cx="24"
            cy="24"
            r="19"
            fill="none"
            stroke="currentColor"
            class="text-sf-bg-2"
            stroke-width="6"
          />
          <circle
            cx="24"
            cy="24"
            r="19"
            fill="none"
            stroke="currentColor"
            stroke-width="6"
            stroke-linecap="round"
            stroke-dasharray="119.38"
            :class="ringColorClass"
            :stroke-dashoffset="119.38 - (119.38 * Math.round(animatedProgress)) / 100"
          />
        </svg>
        <span
          class="absolute inset-0 grid place-content-center text-[9px] font-bold text-sf-text"
        >
          {{ Math.round(animatedProgress) }}
        </span>
      </span>
      <!-- 桌面显示标题与缺失项数量，窄屏隐藏 -->
      <span class="flex min-w-0 flex-col gap-1 max-md:hidden">
        <span class="truncate text-[11px] leading-none font-semibold text-sf-text">
          {{ $t("resumeCompletion") }}
        </span>
        <span v-if="missingCount > 0" class="truncate text-[10px] leading-none text-sf-text-3">
          {{ $t("resumeMissingCount", { count: missingCount }) }}
        </span>
      </span>
      <!-- 有格式错误时提示：进度不受影响，但需要用户回头修 -->
      <SfIcon
        v-if="progressData.hasError"
        icon="mdi:alert-circle"
        size="3"
        class="shrink-0 text-sf-warning max-md:absolute max-md:top-0.5 max-md:right-0.5"
      />
    </button>
  </SfTooltip>

  <SfModal v-model="visible" :title="$t('progressDetail')">
    <div class="flex w-full max-w-[400px] flex-col gap-1.5">
      <p class="mb-2 text-sm text-sf-text-2">{{ $t("atsScoreDisclaimer") }}</p>
      <!-- 列表过长时在滚动区域内查看。 -->
      <SfScrollbar max-height="60vh">
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
            <!-- 待处理项：格式问题、缺失字段与时间线问题统一成同一套条目 -->
            <div
              v-if="getTodoList(item).length"
              class="mt-3 flex flex-col gap-1 rounded-xl bg-sf-bg-2 p-2"
            >
              <div
                v-for="(todo, index) in getTodoList(item)"
                :key="index"
                class="text-xs leading-5 text-sf-text-2"
              >
                {{ todo }}
              </div>
              <div class="mt-1 cursor-pointer text-sm text-sf-theme" @click="goFill(item)">
                {{ $t("modify") }}
              </div>
            </div>
            <!-- 建议补充：非必填项未填写时提示，不计入完成度 -->
            <div v-if="item.optional?.length" class="mt-2 text-xs leading-5 text-sf-text-3">
              {{ $t("resumeOptionalSuggest") }}：{{ item.optional.join("、") }}
            </div>
          </div>
        </template>
      </SfScrollbar>
    </div>
  </SfModal>
</template>
