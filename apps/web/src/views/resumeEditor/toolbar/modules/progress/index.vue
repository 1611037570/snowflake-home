<script setup>
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { useProgress } from "../../../hooks/useProgress";
import { jumpToEditor } from "../../../useModuleNav";
import { TransitionPresets, useTransition } from "@vueuse/core";
import { computed, ref } from "vue";
import { useResumeStats } from "./useResumeStats";

const resumeStore = useResumeStore();
const { system, currentData } = storeToRefs(resumeStore);

// 弹窗显隐控制
const visible = ref(false);

// 计算简历完成度进度及各模块进度（含时间线一致性检查结果）
const progressData = useProgress(currentData);
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

// 简历总字数数字过渡动画
const animatedWords = useTransition(
  computed(() => resumeStats.value.total.total),
  {
    duration: 500,
    transition: TransitionPresets.easeOutCubic,
  },
);

// 弹窗外提示文案：时间线存在问题时提醒
const tooltipText = computed(() =>
  timelineData.value.issueCount
    ? `时间线存在 ${timelineData.value.issueCount} 处问题，点击查看`
    : "查看完成度详情",
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
const getTypeLabel = () => "间隙过大";

// 按进度区间返回进度条颜色
const getProgressColor = (progress) => {
  if (progress >= 80) return "bg-sf-success";
  if (progress >= 50) return "bg-sf-theme";
  if (progress >= 30) return "bg-sf-warning";
  return "bg-sf-error";
};
</script>

<template>
  <div
    v-if="system.showProgress"
    class="absolute -top-12 -right-10 z-50 -translate-y-1/2 transform"
  >
    <SfTooltip :content="tooltipText" placement="left">
      <div
        class="relative flex w-[90px] cursor-pointer items-start rounded-2xl bg-linear-to-r from-blue-500 to-purple-500 p-3 text-white transition-all duration-300"
        @click="visible = true"
      >
        <div class="flex flex-col items-center justify-center">
          <!-- 有时间线问题时：感叹号替换进度数字，与顶部备份样式一致 -->
          <SfIcon
            v-if="timelineData.issueCount"
            icon="ph:warning-fill"
            size="6"
            class="text-sf-warning"
          />
          <div v-else class="flex items-center text-[14px] font-bold">
            <span>{{ Math.round(animatedProgress) }}</span
            ><span class="text-[10px]">%</span>
          </div>
          <!-- <div class="text-[11px] opacity-90">完成度</div> -->
          <!-- 简历总字数 -->
          <div class="text-[10px] opacity-80">{{ Math.round(animatedWords) }}字</div>
        </div>
      </div>
    </SfTooltip>
  </div>

  <SfModal v-model="visible" title="完成度详情">
    <div class="flex w-[400px] flex-col gap-1.5">
      <!-- 各模块进度列表 -->
      <template v-for="item in progressData.list" :key="item.key">
        <div class="rounded-3xl border border-sf-b p-3">
          <div class="flex items-center justify-between">
            <div class="text-lg">
              {{ item.name }}
              <span class="text-sm text-sf-text-2"> 编写{{ resumeStats[item.key].total }}字 </span>
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
              去修改
            </div>
          </div>
          <template v-if="item.progress < 100">
            <div class="mt-2 flex flex-wrap gap-1 text-xs text-sf-text-2">
              <span
                v-for="(field, index) in item.missing"
                :key="index"
                class="rounded-full bg-sf-bg-2 px-2 py-0.5"
              >
                缺：{{ field }}
              </span>
            </div>
            <div class="mt-2 cursor-pointer text-sm text-sf-theme" @click="goFill(item)">
              去填写
            </div>
          </template>
        </div>
      </template>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
