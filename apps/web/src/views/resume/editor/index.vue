<template>
  <div class="resume-editor-workspace flex h-svh w-full flex-col overflow-hidden bg-sf-page" v-if="currentIndex != -1">
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
          :style="{ '--resume-toolbar-width': !isMobile && !focusMode ? `${toolbarWidth}px` : '0px' }"
        >
          <!-- 中间预览栏 -->
          <div class="relative flex min-w-0 flex-1">
            <Transition name="resume-motion" appear>
              <Preview class="motion-preview" :class="{ 'ai-generating': isGenerating }" />
            </Transition>
          </div>
          <!-- 桌面工具栏定位悬浮，不再占据预览布局宽度；移动端保留原有抽屉。 -->
          <div
            v-if="!focusMode"
            ref="toolbarRef"
            :class="isMobile ? 'contents' : 'absolute inset-y-0 right-0 z-20 flex'"
          >
            <Transition :name="isMobile ? '' : 'resume-motion'" appear>
              <Toolbar />
            </Transition>
          </div>
          <AiMask :visible="isGenerating" />
        </div>
      </Transition>
      <!-- 导出加载浮层：teleport 到 body 全屏展示 -->
      <Teleport to="body">
        <ExportMask v-if="isPrinting" @cancel="cancelPrinting" />
        <!-- 智能一页压缩浮层：与导出共用遮罩，屏蔽试参数过程中的排版变化 -->
        <ExportMask
          v-if="isFittingOnePage"
          :title="$t('compressingOnePage')"
          :tip="$t('adjustingLayout')"
          :cancel-text="$t('cancelCompression')"
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
      <span>{{ $t("exitFocus") }}</span>
    </div>
    <!-- 非推荐浏览器时显示建议提示 -->
    <DetectTip />
  </div>
</template>

<script setup>
import { useResumeStore, useSystemStore } from "@/stores";
import { SF_ICON_LIST_KEY } from "@/components/base/icon";
import { onKeyStroke, useResizeObserver } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { provide, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { useRuntimeData } from "./hooks/useRuntimeData";
import Builder from "./panel/index.vue";
import AiMask from "./components/aiMask.vue";
import Header from "./components/header/index.vue";
import ExportMask from "./components/exportMask.vue";
import DetectTip from "./components/detectTip.vue";
import MobileWorkspaceNav from "./components/mobileWorkspaceNav.vue";
import Preview from "./preview/index.vue";
import Toolbar from "./toolbar/index.vue";
import { PROJECT_ICON_LIST } from "./data/localIcons";

const router = useRouter();
const route = useRoute();
const systemStore = useSystemStore();
const { isMobile } = storeToRefs(systemStore);
const mobilePanel = ref("preview");
const toolbarRef = ref(null);
const toolbarWidth = ref(0);
// 按工具栏实际宽度为桌面滚动区预留空间，移动端由模板明确取消留白。
useResizeObserver(toolbarRef, ([entry]) => {
  toolbarWidth.value = entry.contentRect.width;
});

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
    await resumeStore.loadResume(String(id));
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

// 路由离开前确认内容已落库，写入失败保留当前编辑页面。
onBeforeRouteLeave(async () => {
  try { await resumeStore.savePendingResumes(); }
  catch { ElMessage.error("简历保存失败，请重试后再离开"); return false; }
});

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
/* 中间分隔线预先合成顶部背景上的边框颜色，避免透明边框叠在黑底上变暗。 */
.resume-editor-workspace {
  /* 分隔线颜色：浅色模式按顶部背景与边框的实际比例合成不透明颜色。 */
  --resume-separator-color: color-mix(in srgb, var(--sf-primary) 90%, var(--sf-base) 10%);
}
:global(.dark) .resume-editor-workspace {
  /* 分隔线颜色：深色模式保持与顶部四分之一透明度的白色边框一致。 */
  --resume-separator-color: color-mix(in srgb, var(--sf-primary) 75%, var(--sf-base) 25%);
}
.resume-editor-workspace :deep(.mobile-resume-builder) {
  border-right-color: var(--resume-separator-color);
}

/* 各区域仅提供动画参数，进入、离开统一由同一套过渡规则处理 */
.motion-header {
  --motion-enter-transform: translateY(-100%);
  --motion-leave-transform: translateY(-100%);
  --motion-enter-duration: 0.48s;
}

.motion-builder {
  --motion-enter-transform: translateX(-100%);
  --motion-leave-transform: translateX(-100%);
  /* 编辑区尽早进入可见位置，减少首次进入的视觉等待。 */
  --motion-enter-duration: 0.18s;
  --motion-enter-delay: 0s;
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
    transform var(--motion-enter-duration, 0.36s) cubic-bezier(0.22, 1, 0.36, 1)
      var(--motion-enter-delay, 0s),
    opacity var(--motion-enter-duration, 0.36s) cubic-bezier(0.22, 1, 0.36, 1)
      var(--motion-enter-delay, 0s);
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
