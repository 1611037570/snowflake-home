<template>
  <div class="flex h-svh w-full flex-col overflow-hidden bg-sf-page" v-if="currentIndex != -1">
    <Transition name="resume-motion" appear>
      <Header v-if="!focusMode" class="motion-header" />
    </Transition>
    <div v-if="currentIndex >= 0" class="relative flex w-full min-w-0 flex-1 overflow-hidden">
      <!-- 左侧操作栏：移动端自左侧滑动进出 -->
      <Transition name="resume-motion" appear>
        <Builder
          v-show="!isMobile || mobilePanel === 'edit'"
          class="mobile-panel"
          :class="[
            isMobile ? 'motion-mobile-left' : 'motion-builder',
            { 'ai-generating': isGenerating },
          ]"
        />
      </Transition>
      <!-- 预览栏：移动端自右侧滑动进出，非移动端不需要切换动画 -->
      <Transition :name="isMobile ? 'resume-motion' : ''">
        <div
          v-show="!isMobile || mobilePanel === 'preview'"
          class="mobile-panel relative flex min-w-0 flex-1 overflow-hidden"
          :class="{ 'motion-mobile-right': isMobile }"
        >
          <!-- 中间预览栏 -->
          <div class="relative flex min-w-0 flex-1">
            <Transition name="resume-motion" appear>
              <Preview class="motion-preview" :class="{ 'ai-generating': isGenerating }" />
            </Transition>
          </div>
          <!-- 最右侧系统配置栏：工具栏与 QA 入口整体垂直居中 -->
          <Transition name="resume-motion" appear>
            <div
              v-if="!focusMode && !isMobile"
              class="motion-toolbar relative flex h-full flex-col items-center justify-center gap-3"
            >
              <Toolbar />
            </div>
          </Transition>
          <AiMask :visible="isGenerating" />
        </div>
      </Transition>
      <!-- 导出加载浮层：teleport 到 body 全屏展示 -->
      <Teleport to="body">
        <ExportMask v-if="isPrinting" @cancel="cancelPrinting" />
        <!-- 智能一页压缩浮层：与导出共用遮罩，屏蔽试参数过程中的排版变化 -->
        <ExportMask
          v-if="isFittingOnePage"
          title="正在压缩为一页"
          tip="正在调整排版参数"
          cancel-text="取消压缩"
          @cancel="cancelFittingOnePage"
        />
      </Teleport>
    </div>
    <MobileWorkspaceNav
      v-if="isMobile"
      :active-panel="mobilePanel"
      @select="mobilePanel = $event"
    />
    <!-- 专注写作模式：右上角浮动退出按钮 -->
    <div
      v-if="focusMode"
      class="fixed top-3 right-3 z-90 flex cursor-pointer items-center gap-2 rounded-full border border-sf-b bg-sf-primary px-3 py-2 text-sm text-sf-text-2 transition-colors hover:text-sf-theme"
      @click="setFocusMode(false)"
    >
      <SfIcon icon="carbon:minimize" size="5" />
      <span>退出专注</span>
    </div>
    <!-- 非推荐浏览器时显示建议提示 -->
    <DetectTip />
    <!-- 问题反馈与分享入口：固定在编辑器视口右下角 -->
    <IssueFeedback v-if="!focusMode && !isMobile" />
    <Share v-if="!focusMode && !isMobile" />
  </div>
</template>

<script setup>
import { useResumeStore, useSystemStore } from "@/stores";
import { SF_ICON_LIST_KEY } from "@/components/base/icon";
import { onKeyStroke } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { provide, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRuntimeData } from "./hooks/useRuntimeData";
import Builder from "./builder/index.vue";
import AiMask from "./components/aiMask.vue";
import Header from "./components/header/index.vue";
import ExportMask from "./components/exportMask.vue";
import DetectTip from "./components/detectTip.vue";
import MobileWorkspaceNav from "./components/mobileWorkspaceNav.vue";
import IssueFeedback from "../components/issueFeedback.vue";
import Share from "../components/share.vue";
import Preview from "./preview/index.vue";
import Toolbar from "./toolbar/index.vue";
import { PROJECT_ICON_LIST } from "./icons";

const router = useRouter();
const route = useRoute();
const systemStore = useSystemStore();
const { isMobile } = storeToRefs(systemStore);
const mobilePanel = ref("preview");

const resumeStore = useResumeStore();
// 编辑器统一注入本地图标，子组件无需逐层传递
provide(SF_ICON_LIST_KEY, PROJECT_ICON_LIST);
// 补齐旧版本系统配置，确保新增开关立即参与渲染
resumeStore.init();
const { initResumeStatus, setFocusMode, cancelPrinting, cancelFittingOnePage } = resumeStore;
const {
  currentIndex,
  focusMode,
  resumeList: list,
  currentUsage,
  isGenerating,
  isPrinting,
  isFittingOnePage,
  currentData,
} = storeToRefs(resumeStore);

// 移动端进入编辑器时默认先展示简历预览。
watch(
  isMobile,
  (value) => {
    if (value) mobilePanel.value = "preview";
  },
  { immediate: true },
);

// 切换简历时清空上一个简历的模块选中状态
watch(
  () => route.query.id,
  async (id) => {
    // 根据路由参数定位当前编辑的简历
    if (!id) {
      router.push("/resume/mine");
      return;
    }
    await resumeStore.init();
    if (String(route.query.id || "") !== String(id)) return;
    const index = list.value.findIndex((item) => item.id === id);
    if (index == -1) {
      router.push("/resume/mine");
      return;
    }
    // 切换简历前取消上一份简历的打印任务
    if (currentIndex.value !== index) {
      cancelPrinting();
      cancelFittingOnePage();
    }
    // 先定位当前简历，再初始化状态；配置同步由 Builder 执行
    currentIndex.value = index;
    initResumeStatus();
  },
  { immediate: true },
);

// 采集简历编辑器首屏首帧与运行环境
const { collectFirstFrame, collectEnv } = useRuntimeData();
collectFirstFrame();
collectEnv();

// 向下游组件注入简历原始数据，预览层只读使用
provide("previewData", currentData);

// 专注模式下按 ESC 退出
onKeyStroke("Escape", () => {
  if (focusMode.value) setFocusMode(false);
});

onMounted(() => {});

onUnmounted(() => {
  // 离开编辑器时取消未完成的打印任务
  cancelPrinting();
  // 离开编辑器时取消未完成的智能一页压缩
  cancelFittingOnePage();
  if (currentUsage.value) {
    currentUsage.value.lastUseTime = Date.now();
  }
});
</script>

<style scoped>
/* 各区域仅提供动画参数，进入、离开统一由同一套过渡规则处理 */
.motion-header {
  --motion-enter-transform: translateY(-100%);
  --motion-leave-transform: translateY(-100%);
  --motion-enter-duration: 0.48s;
}

.motion-builder {
  --motion-enter-transform: translateX(-100%);
  --motion-leave-transform: translateX(-100%);
  --motion-enter-duration: 0.42s;
  --motion-enter-delay: 0.06s;
}

.motion-preview {
  --motion-enter-transform: translateY(100px);
  --motion-leave-transform: none;
  --motion-enter-duration: 0.36s;
  --motion-enter-delay: 0.12s;
}

.motion-toolbar {
  --motion-enter-transform: translateX(100%);
  --motion-leave-transform: translateX(100%);
  --motion-enter-duration: 0.24s;
  --motion-enter-delay: 0.24s;
}

.motion-mobile-left {
  --motion-enter-transform: translateX(-100%);
  --motion-leave-transform: translateX(-100%);
  --motion-enter-opacity: 1;
  --motion-leave-opacity: 1;
  --motion-enter-duration: 0.3s;
  --motion-leave-duration: 0.3s;
  --motion-leave-easing: cubic-bezier(0.22, 1, 0.36, 1);
}

.motion-mobile-right {
  --motion-enter-transform: translateX(100%);
  --motion-leave-transform: translateX(100%);
  --motion-enter-opacity: 1;
  --motion-leave-opacity: 1;
  --motion-enter-duration: 0.3s;
  --motion-leave-duration: 0.3s;
  --motion-leave-easing: cubic-bezier(0.22, 1, 0.36, 1);
}

.resume-motion-enter-active,
.resume-motion-leave-active {
  will-change: transform, opacity;
}

.resume-motion-enter-active {
  transition:
    transform var(--motion-enter-duration, 0.36s) cubic-bezier(0.22, 1, 0.36, 1) var(--motion-enter-delay, 0s),
    opacity var(--motion-enter-duration, 0.36s) cubic-bezier(0.22, 1, 0.36, 1) var(--motion-enter-delay, 0s);
}

.resume-motion-leave-active {
  transition:
    transform var(--motion-leave-duration, 0.25s) var(--motion-leave-easing, ease),
    opacity var(--motion-leave-duration, 0.25s) var(--motion-leave-easing, ease);
}

.resume-motion-enter-from {
  opacity: var(--motion-enter-opacity, 0);
}

.resume-motion-enter-from {
  transform: var(--motion-enter-transform, translateY(16px));
}

.resume-motion-leave-to {
  transform: var(--motion-leave-transform, translateY(16px));
  opacity: var(--motion-leave-opacity, 0);
}

/* 移动端两面板改为叠层：切换过程中互不挤压布局 */
@media (max-width: 767px) {
  .mobile-panel {
    position: absolute !important;
    inset: 0;
  }
}

</style>
