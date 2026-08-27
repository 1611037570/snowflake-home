<script setup>
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { useProgress } from "../../utils";
import { nextTick, ref } from "vue";

const resumeStore = useResumeStore();
const { system, currentData } = storeToRefs(resumeStore);

// 弹窗显隐控制
const visible = ref(false);

// 计算简历完成度进度及各模块进度
const progressData = useProgress(currentData);

// 跳转编辑对应模块：展开折叠并滚动定位
const goFill = (item) => {
  // 展开模块折叠面板
  const moduleData = currentData.value?.[item.key];
  if (moduleData && Array.isArray(moduleData.collapsed)) {
    moduleData.collapsed = ["1"];
  }
  visible.value = false;
  nextTick(() => {
    document
      .querySelector(`[data-module-key="${item.key}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

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
    <div
      class="h-[66px] w-[90px] cursor-pointer rounded-2xl bg-linear-to-r from-blue-500 to-purple-500 p-3 text-white transition-all duration-300 hover:scale-105"
      @click="visible = true"
    >
      <div class="flex w-10 flex-col items-center justify-center">
        <div class="flex items-center text-[16px] font-bold">
          <span>{{ progressData.progress }}</span
          ><span class="text-[14px]">%</span>
        </div>
        <div class="text-[11px] opacity-90">完成度</div>
      </div>
    </div>
  </div>

  <SfModal v-model="visible" title="完成度详情">
    <div class="flex w-[400px] flex-col gap-3">
      <template v-for="item in progressData.list" :key="item.key">
        <div class="rounded-3xl border border-sf-b p-3">
          <div class="flex items-center justify-between">
            <div class="text-lg">{{ item.name }}</div>
            <div class="text-lg font-bold">{{ item.progress }}%</div>
          </div>
          <div class="mt-2 h-2 w-full rounded-full bg-sf-bg-2">
            <div
              class="h-2 rounded-full transition-all duration-300"
              :class="getProgressColor(item.progress)"
              :style="{ width: item.progress + '%' }"
            ></div>
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
