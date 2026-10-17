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
import Donation from "./modules/donation.vue";
import Share from "./modules/share.vue";
import Feedback from "./modules/feedback.vue";
import QaAnswer from "./modules/qaAnswer.vue";
import LiuyaoWenxin from "./modules/liuyaoWenxin.vue";
import { $t } from "@/locales";

// 调试面板默认关闭，保持异步按需加载
const Debug = defineAsyncComponent(() => import("./modules/debug.vue"));

defineOptions({ name: "ResumeToolbar" });

const router = useRouter();
const resumeStore = useResumeStore();
const { currentItem } = storeToRefs(resumeStore);
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
  {
    key: "home",
    component: Icon,
    attrs: {
      icon: "akar-icons:home-alt1",
      size: "5",
      content: $t("backHome"),
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
  { key: "separator-main", type: "separator" },
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
            content: $t("focusMode"),
            onOnClick: enterFocusMode,
          },
        },
      ]
    : []),
  { key: "separator-secondary", type: "separator" },
  { key: "debug", component: Debug },

  { key: "ai", component: Ai },
  { key: "system", component: System },
  // ATS 参考入口固定在主要工具组末尾。
  { key: "progress", component: Progress },
  { key: "separator-support", type: "separator" },
  { key: "share", component: Share },
  { key: "feedback", component: Feedback },
  { key: "donation", component: Donation },
  { key: "qa-answer", component: QaAnswer },
  { key: "liuyao-wenxin", component: LiuyaoWenxin },
]);
</script>

<template>
  <!-- 移动端把手与工具栏共用悬浮容器，展开时整组从屏幕右侧滑入 -->
  <div
    class="flex items-center justify-center"
    :class="
      isMobile
        ? 'fixed inset-y-0 right-0 z-50 transition-transform duration-300 ease-out'
        : 'relative flex-col items-center gap-3 py-3 pr-3'
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
      :aria-label="expanded ? $t('collapseToolbar') : $t('expandToolbar')"
      @click="expanded = !expanded"
    >
      <SfIcon :icon="expanded ? 'lucide:chevron-right' : 'lucide:chevron-left'" size="4" />
    </button>

    <div
      class="flex flex-col items-center justify-center"
      :class="isMobile && 'mobile-toolbar-panel h-svh  border-l border-sf-b bg-sf-primary p-3'"
    >
      <div
        class="relative flex w-12 flex-col items-center gap-0 overflow-visible rounded-3xl border border-sf-b bg-sf-primary py-3 text-sf-text-3 shadow-sm transition-all duration-300 hover:border-sf-theme/40 hover:shadow-md"
        :class="{ 'shrink-0': isMobile }"
      >
        <!-- 简历 ID 固定显示在工具栏顶部。 -->
        <span
          class="flex w-full flex-col items-center gap-0 border-b border-sf-b pb-3 text-center text-[9px] leading-3 tracking-wider text-sf-text-3"
          :title="`ID ${currentItem?.id || ''}`"
        >
          <span>ID</span>
          <span class="max-w-9 truncate">{{ currentItem?.id }}</span>
        </span>
        <template v-for="item in toolbarItems" :key="item.key">
          <div v-if="item.type === 'separator'" class="h-px w-6 bg-sf-b opacity-60"></div>
          <component v-else :is="item.component" v-bind="item.attrs" />
        </template>
      </div>
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
