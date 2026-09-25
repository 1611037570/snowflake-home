<script setup>
import { useResumeStore, useSystemStore } from "@/stores";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { computed, defineAsyncComponent, ref } from "vue";
import Icon from "./components/icon.vue";
import Ai from "./modules/ai/index.vue";
import System from "./modules/system/index.vue";
import CopyResume from "./modules/copyResume.vue";
import Progress from "./modules/progress/index.vue";
import ModuleNavigator from "./modules/moduleNavigator.vue";
import QaAnswer from "./modules/qaAnswer.vue";
import LiuyaoWenxin from "./modules/liuyaoWenxin.vue";

// 调试面板默认关闭，保持异步按需加载
const Debug = defineAsyncComponent(() => import("./modules/debug.vue"));

defineOptions({ name: "ResumeToolbar" });

const router = useRouter();
const resumeStore = useResumeStore();
const { system, currentItem } = storeToRefs(resumeStore);
const systemStore = useSystemStore();
const { isMobile } = storeToRefs(systemStore);

// 移动端工具栏抽屉展开状态：移动端默认收起，由右侧把手按钮控制
const expanded = ref(false);
function goHome() {
  router.push("/resume");
}
function enterFocusMode() {
  resumeStore.setFocusMode(true);
}
function goGitHub() {
  urlNavigation("https://github.com/1611037570/snowflake-home");
}

const toolbarItems = computed(() => [
  ...(system.value.showProgress ? [{ key: "progress", component: Progress }] : []),
  { key: "system", component: System },
  { key: "ai", component: Ai },
  { key: "debug", component: Debug },
  { key: "separator-main", type: "separator" },
  { key: "module-navigator", component: ModuleNavigator },
  { key: "copy-resume", component: CopyResume },
  // 专注模式仅在非移动端提供。
  ...(!isMobile.value
    ? [
        {
          key: "focus-mode",
          component: Icon,
          attrs: {
            icon: "lucide:focus",
            size: "5",
            content: "专注模式",
            onOnClick: enterFocusMode,
          },
        },
      ]
    : []),
  { key: "separator-secondary", type: "separator" },
  {
    key: "home",
    component: Icon,
    attrs: {
      icon: "akar-icons:home-alt1",
      size: "5",
      content: "返回首页",
      onOnClick: goHome,
    },
  },
  {
    key: "github",
    component: Icon,
    attrs: {
      icon: "simple-icons:github",
      size: "5",
      content: "GitHub",
      onOnClick: goGitHub,
    },
  },
]);
</script>

<template>
  <!-- 移动端把手与工具栏共用悬浮容器，展开时整组从屏幕右侧滑入 -->
  <div
    class="flex items-center justify-center"
    :class="
      isMobile
        ? 'fixed inset-y-0 right-0 z-50 transition-transform duration-300 ease-out'
        : 'relative flex-col items-center gap-3 p-3'
    "
    :style="
      isMobile && {
        transform: expanded ? 'none' : 'translateX(calc(100% - 1.5rem))',
      }
    "
  >
    <!-- 移动端右侧把手随工具栏整体滑动；桌面端工具栏常驻 -->
    <button
      v-if="isMobile"
      type="button"
      class="relative z-10 flex h-12 w-6 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-l-2xl border border-r-0 border-sf-b bg-sf-primary text-sf-text-2 transition-colors hover:text-sf-theme"
      :aria-expanded="expanded"
      :aria-label="expanded ? '收起工具栏' : '展开工具栏'"
      @click="expanded = !expanded"
    >
      <SfIcon :icon="expanded ? 'lucide:chevron-right' : 'lucide:chevron-left'" size="4" />
    </button>

    <div
      class="flex flex-col items-center justify-center gap-3"
      :class="isMobile && 'mobile-toolbar-panel h-svh  border-l border-sf-b bg-sf-primary p-3'"
    >
      <div
        class="relative flex w-[50px] flex-col items-center gap-2 rounded-3xl border border-sf-b bg-sf-transparent py-2 text-sf-text-3"
        :class="{ 'shrink-0': isMobile }"
      >
        <template v-for="item in toolbarItems" :key="item.key">
          <div v-if="item.type === 'separator'" class="h-[0.5px] w-full bg-sf-bg-2"></div>
          <component v-else :is="item.component" v-bind="item.attrs" />
        </template>
        <!-- 将简历 ID 放在工具项下方，避免遮挡顶部进度组件 -->
        <span
          class="w-full border-t border-sf-b pt-3 text-center text-[9px] leading-3 text-sf-text-3"
          :title="`ID ${currentItem?.id || ''}`"
        >
          ID<br />{{ currentItem?.id }}
        </span>
      </div>
      <!-- QA 解答与六爻入口按正常纵向布局排列 -->
      <QaAnswer />
      <LiuyaoWenxin />
    </div>
  </div>

  <!-- 移动端展开时的遮罩：点击空白区域收起工具栏 -->
  <div
    v-if="isMobile && expanded"
    class="fixed inset-0 z-40 bg-sf-text"
    style="opacity: 0.2"
    @click="expanded = false"
  />
</template>

<style scoped>
.mobile-toolbar-panel {
  justify-content: safe center;
}
</style>
