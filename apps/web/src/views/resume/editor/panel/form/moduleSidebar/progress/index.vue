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
import eventBus from "@/utils/modules/eventBus";
import OneKeyIntro from "../../../../components/oneKeyIntro.vue";
import { useOneKeyActions } from "../../../../hooks/useOneKeyActions";

const resumeStore = useResumeStore();
const { currentData, runtimeFields, currentUI, isGenerating } = storeToRefs(resumeStore);

// 一键入口共用说明弹窗与流程启动，优化和调整都沿用同一套通用流程
const { introVisible, introFlow, openOneKeyIntro, confirmOneKeyIntro } = useOneKeyActions(
  (flow) => eventBus.emit("resume-start-assistant-flow", flow),
);

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

// 格式问题总数：用于入口摘要文案
const formatIssueCount = computed(() =>
  progressData.value.list.reduce((total, item) => total + (item.issues?.length || 0), 0),
);

// 缺失、格式或时间线任一检查未通过时先调整，全部通过后才进入内容优化。
const needsAdjustment = computed(
  () =>
    progressData.value.progress < 100 ||
    missingCount.value > 0 ||
    formatIssueCount.value > 0 ||
    timelineData.value.issueCount > 0,
);
const aiActionLabel = computed(() => {
  if (isGenerating.value) {
    return $t(needsAdjustment.value ? "adjustingResume" : "optimizingResume");
  }
  return $t(needsAdjustment.value ? "oneClickAdjust" : "oneClickOptimize");
});
// 调整使用警示色提示尚有问题，全部通过后的优化使用成功色。
const aiActionClass = computed(() =>
  needsAdjustment.value
    ? "bg-sf-warning-2 text-sf-warning hover:bg-sf-warning hover:text-white"
    : "bg-sf-success-2 text-sf-success hover:bg-sf-success hover:text-white",
);

// 从检查入口切换到 AI 标签，并交由对应流程处理整份简历。
const startAiAction = () => {
  if (isGenerating.value) return;
  // 存在检查问题时先调整，全部通过后再进入内容优化
  openOneKeyIntro(needsAdjustment.value ? "oneKeyAdjust" : "oneKeyOptimize");
};

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
  <!-- 操作按钮放在圆环旁，检查摘要下沉到原按钮所在的整行区域。 -->
  <div class="mb-1.5 flex w-full shrink-0 flex-col gap-1 border-b border-sf-b pb-1.5">
    <div class="flex items-center gap-1 max-md:flex-col">
      <SfTooltip :content="tooltipText" placement="right" class="block shrink-0">
        <button
          type="button"
          class="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-sf-bg"
          :aria-label="$t('progressDetail')"
          @click="visible = true"
        >
          <svg class="h-8 w-8 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
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
          <span class="absolute inset-0 grid place-content-center text-[10px] font-bold text-sf-text">
            {{ Math.round(animatedProgress) }}
          </span>
        </button>
      </SfTooltip>
      <button
        type="button"
        class="flex h-8 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-3xl px-1 text-xs font-medium transition-colors disabled:cursor-wait disabled:opacity-60 max-md:w-8 max-md:flex-none max-md:px-0"
        :class="aiActionClass"
        :disabled="isGenerating"
        @click="startAiAction"
      >
        <SfIcon :icon="isGenerating ? 'line-md:loading-twotone-loop' : 'lucide:sparkles'" size="3" />
        <span class="truncate max-md:hidden">{{ aiActionLabel }}</span>
      </button>
    </div>
    <!-- 完成时隐藏状态文字，仅展示待处理问题 -->
    <button
      v-if="needsAdjustment"
      type="button"
      class="flex w-full cursor-pointer flex-col rounded-2xl px-2 text-left text-[10px] leading-4 text-sf-warning transition-colors max-md:hidden"
      :aria-label="$t('progressDetail')"
      @click="visible = true"
    >
      <span v-if="missingCount > 0">{{ $t("resumeMissingCount", { count: missingCount }) }}</span>
      <span v-if="formatIssueCount > 0">
        {{ $t("resumeFormatIssueCount", { count: formatIssueCount }) }}
      </span>
      <span v-if="timelineData.issueCount > 0">
        {{ $t("resumeTimelineIssueCount", { count: timelineData.issueCount }) }}
      </span>
    </button>
  </div>

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
          </div>
        </template>
      </SfScrollbar>
    </div>
  </SfModal>

  <OneKeyIntro v-model="introVisible" :flow="introFlow" @confirm="confirmOneKeyIntro" />
</template>
