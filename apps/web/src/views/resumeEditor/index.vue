<template>
  <div class="flex h-full w-full flex-col bg-sf-page" v-if="currentIndex != -1">
    <Transition name="resume-header" appear>
      <Header v-if="!focusMode" />
    </Transition>
    <div class="relative flex w-full flex-1 overflow-hidden" v-if="currentIndex >= 0">
      <div class="relative flex min-w-0 flex-1 overflow-hidden">
        <!-- 左侧操作栏 -->
        <Transition name="resume-builder" appear>
          <Builder
            v-show="focusMode || layout !== 'ai'"
            :class="{ 'ai-generating': isGenerating }"
          />
        </Transition>
        <!-- 中间预览栏 -->
        <Transition name="resume-preview" appear>
          <Preview :class="{ 'ai-generating': isGenerating }" />
        </Transition>
        <GeneratingMask v-if="isGenerating && !isPrinting" :visible="true" />
      </div>
      <!-- 右侧AI助手栏 -->
      <Transition name="resume-assistant" appear>
        <Assistant v-show="!focusMode && layout !== 'list'" />
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
      <!-- 导出加载浮层：teleport 到 body 全屏展示 -->
      <Teleport to="body">
        <GeneratingMask
          v-if="isPrinting"
          :visible="true"
          overlay
          title="正在导出简历"
          description="请稍候，文件即将下载"
          aria-label="正在导出简历，请稍候"
        />
      </Teleport>
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
    <!-- 环境检测：浏览器与窗口尺寸不符合时右侧弹窗提示 -->
    <DetectTip />
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
import DetectTip from "./components/detectTip.vue";
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
    // 根据路由参数定位当前编辑的简历
    if (!id) {
      router.push("/resume/mine");
      return;
    }
    const index = list.value.findIndex((item) => item.id === id);
    if (index == -1) {
      router.push("/resume/mine");
      return;
    }
    // 先定位当前简历，再初始化状态；配置同步由 Builder 执行
    currentIndex.value = index;
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

// 专注模式下按 ESC 退出
onKeyStroke("Escape", () => {
  if (focusMode.value) setFocusMode(false);
});

onMounted(() => {});

onUnmounted(() => {
  if (currentUsage.value) {
    currentUsage.value.lastUseTime = Date.now();
  }
});
</script>

<style scoped>
/* 进入：错峰起步，同一时刻到达终点 */
.resume-header-enter-active {
  transition:
    transform 0.48s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.48s cubic-bezier(0.22, 1, 0.36, 1);
}

.resume-builder-enter-active {
  transition:
    transform 0.42s cubic-bezier(0.22, 1, 0.36, 1) 0.06s,
    opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1) 0.06s;
}

/* 预览面板：自下向上滑动淡入（仅位移与透明度，避免缩放导致重栅格化卡顿） */
.resume-preview-enter-active {
  transition:
    transform 0.36s cubic-bezier(0.22, 1, 0.36, 1) 0.12s,
    opacity 0.36s cubic-bezier(0.22, 1, 0.36, 1) 0.12s;
}

.resume-assistant-enter-active {
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1) 0.18s,
    opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1) 0.18s;
}

.resume-toolbar-enter-active {
  transition:
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1) 0.24s,
    opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1) 0.24s;
}

/* 离开：保持快速退场，不受进入错峰影响 */
.resume-builder-leave-active,
.resume-assistant-leave-active,
.resume-header-leave-active,
.resume-toolbar-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

/* 预览面板退场：仅淡出 */
.resume-preview-leave-active {
  transition: opacity 0.25s ease;
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

.resume-preview-enter-from {
  transform: translateY(100px);
  opacity: 0;
}

.resume-preview-leave-to {
  opacity: 0;
}
</style>
