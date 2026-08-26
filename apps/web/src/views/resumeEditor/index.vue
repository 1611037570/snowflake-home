<template>
  <div class="flex h-full w-full flex-col bg-sf-page" v-if="currentIndex != -1">
    <Header />
    <div class="relative flex w-full flex-1 overflow-hidden" v-if="currentIndex >= 0">
      <div class="relative flex min-w-0 flex-1 overflow-hidden">
        <!-- 左侧操作栏 -->
        <Transition name="resume-builder">
          <Builder v-if="layout !== 'ai'" :class="{ 'ai-generating': isGenerating }" />
        </Transition>
        <!-- 中间预览栏 -->
        <Preview :class="{ 'ai-generating': isGenerating }" />
        <GeneratingMask v-if="isGenerating && !isPrinting" :visible="true" />
      </div>
      <!-- 右侧AI助手栏 -->
      <Transition name="resume-assistant">
        <Assistant v-if="layout !== 'list'" />
      </Transition>
      <GeneratingMask
        v-if="isPrinting"
        :visible="true"
        title="正在导出简历"
        description="请稍候，文件即将下载"
        aria-label="正在导出简历，请稍候"
      />
    </div>
  </div>
</template>

<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { provide, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Assistant from "./assistant/index.vue";
import Builder from "./builder/index.vue";
import Header from "./components/header/index.vue";
import GeneratingMask from "./components/generatingMask.vue";
import Preview from "./preview/index.vue";
// 预览层代理数据及批量操作句柄
import { usePreviewData } from "./preview/usePreviewData";

const router = useRouter();
const route = useRoute();

const resumeStore = useResumeStore();
const { initResumeStatus } = resumeStore;
const { currentIndex, layout, list, currentUsage, isGenerating, isPrinting, currentData } =
  storeToRefs(resumeStore);

// 切换简历时清空上一个简历的模块选中状态
watch(
  () => route.query.id,
  () => {
    // 初始化简历状态
    initResumeStatus();
  },
  { immediate: true },
);

// 创建代理后的预览数据及批量操作句柄（AI 助手与预览层共用）
const { previewData, acceptAll, rejectAll, acceptModule, rejectModule, applyDiff } =
  usePreviewData(currentData);

// 向下游组件注入代理预览数据
provide("previewData", previewData);
// 向下游组件注入：全部保留
provide("acceptAll", acceptAll);
// 向下游组件注入：全部放弃
provide("rejectAll", rejectAll);
// 向下游组件注入：模块级保留与放弃
provide("acceptModule", acceptModule);
provide("rejectModule", rejectModule);
// 向下游组件注入：应用 AI diff
provide("applyDiff", applyDiff);

let useTimeTimer = null;

onMounted(() => {
  const id = route.query.id;
  if (!id) {
    router.push(`/resume`);
    return;
  }
  const index = list.value.findIndex((item) => item.id === id);
  if (index == -1) {
    router.push(`/resume`);
    return;
  }
  currentIndex.value = index;

  useTimeTimer = setInterval(() => {
    currentUsage.value.lastUseTime = Date.now();
  }, 10000);
});

onUnmounted(() => {
  if (useTimeTimer) {
    clearInterval(useTimeTimer);
  }
});
</script>

<style scoped>
.resume-builder-enter-active,
.resume-builder-leave-active,
.resume-assistant-enter-active,
.resume-assistant-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.resume-builder-enter-from,
.resume-builder-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.resume-assistant-enter-from,
.resume-assistant-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
