<template>
  <div class="flex h-full w-full flex-col bg-sf-page" v-if="currentIndex != -1">
    <Transition name="resume-header" appear>
      <Header v-if="!focusMode" />
    </Transition>
    <div class="relative flex w-full flex-1 overflow-hidden" v-if="currentIndex >= 0">
      <div class="relative flex min-w-0 flex-1 overflow-hidden">
        <!-- 左侧操作栏 -->
        <Transition name="resume-builder" appear>
          <Builder v-if="focusMode || layout !== 'ai'" :class="{ 'ai-generating': isGenerating }" />
        </Transition>
        <!-- 中间预览栏 -->
        <Preview :class="{ 'ai-generating': isGenerating }" />
        <GeneratingMask v-if="isGenerating && !isPrinting" :visible="true" />
      </div>
      <!-- 右侧AI助手栏 -->
      <Transition name="resume-assistant" appear>
        <Assistant v-if="!focusMode && layout !== 'list'" />
      </Transition>
      <!-- 最右侧系统配置栏：工具栏与 QA 入口整体垂直居中 -->
      <Transition name="resume-toolbar" appear>
        <div
          v-if="!focusMode"
          class="relative flex h-full flex-col items-center justify-center gap-3"
        >
          <Toolbar />
        </div>
      </Transition>
      <GeneratingMask
        v-if="isPrinting"
        :visible="true"
        title="正在导出简历"
        description="请稍候，文件即将下载"
        aria-label="正在导出简历，请稍候"
      />
    </div>
    <!-- 专注写作模式：右上角浮动退出按钮 -->
    <div
      v-if="focusMode"
      class="fixed top-4 right-4 z-90 flex cursor-pointer items-center gap-2 rounded-full border border-sf-b bg-sf-primary px-4 py-2 text-sm text-sf-text-2 shadow-lg transition-colors hover:text-sf-theme"
      @click="setFocusMode(false)"
    >
      <SfIcon icon="carbon:minimize" size="5" />
      <span>退出专注</span>
    </div>
  </div>
</template>

<script setup>
import { useResumeStore } from "@/stores";
import { onKeyStroke } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { provide, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Assistant from "./assistant/index.vue";
import Builder from "./builder/index.vue";
import Header from "./components/header/index.vue";
import GeneratingMask from "./components/generatingMask.vue";
import Preview from "./preview/index.vue";
import Toolbar from "./toolbar/index.vue";
// 预览层代理数据及批量操作句柄
import { usePreviewData } from "./preview/usePreviewData";

const router = useRouter();
const route = useRoute();

const resumeStore = useResumeStore();
const { initResumeStatus, setFocusMode } = resumeStore;
const {
  currentIndex,
  layout,
  focusMode,
  list,
  currentUsage,
  isGenerating,
  isPrinting,
  currentData,
} = storeToRefs(resumeStore);

// 切换简历时清空上一个简历的模块选中状态
watch(
  () => route.query.id,
  (id) => {
    // 初始化简历状态
    initResumeStatus();
    // 根据路由参数定位当前编辑的简历
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

// 专注模式下按 ESC 退出
onKeyStroke("Escape", () => {
  if (focusMode.value) setFocusMode(false);
});

let useTimeTimer = null;

onMounted(() => {
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
.resume-assistant-leave-active,
.resume-header-enter-active,
.resume-header-leave-active,
.resume-toolbar-enter-active,
.resume-toolbar-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.resume-header-enter-from,
.resume-header-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.resume-toolbar-enter-from,
.resume-toolbar-leave-to {
  transform: translateX(100%);
  opacity: 0;
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
