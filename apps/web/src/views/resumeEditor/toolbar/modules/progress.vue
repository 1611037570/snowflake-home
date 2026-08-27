<script setup>
import { DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/defaultConfig";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { useProgress } from "../../utils";
import { ref } from "vue";

const resumeStore = useResumeStore();
const { system, currentData } = storeToRefs(resumeStore);

// 弹窗显隐控制
const visible = ref(false);

// 计算简历完成度进度及各模块进度
const { list, progress } = useProgress(currentData);

// 根据模块 key 获取中文名称
const getModuleName = (key) => {
  const module = DEFAULT_MODULE_NAMES.find((item) => item.key === key);
  return module?.name || currentData.value?.[key]?.name || key;
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
          <span>{{ progress }}</span
          ><span class="text-[14px]">%</span>
        </div>
        <div class="text-[11px] opacity-90">完成度</div>
      </div>
    </div>
  </div>

  <SfModal v-model="visible" title="完成度详情">
    <div class="flex w-[400px] flex-col gap-3">
      <template v-for="item in list" :key="item.key">
        <div class="rounded-3xl border border-sf-b p-3">
          <div class="flex items-center justify-between">
            <div class="text-lg">{{ getModuleName(item.key) }}</div>
            <div class="text-lg font-bold">{{ item.progress }}%</div>
          </div>
          <div class="mt-2 h-2 w-full rounded-full bg-sf-bg-2">
            <div
              class="h-2 rounded-full bg-sf-theme transition-all duration-300"
              :style="{ width: item.progress + '%' }"
            ></div>
          </div>
        </div>
      </template>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
