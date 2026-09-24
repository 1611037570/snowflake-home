<script setup>
import { useResumeStore, useSystemStore } from "@/stores";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { computed, defineAsyncComponent } from "vue";
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
const { system } = storeToRefs(resumeStore);
const systemStore = useSystemStore();
const { isMobile } = storeToRefs(systemStore);
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
  <div class="relative flex items-center overflow-hidden p-3">
    <div
      class="relative flex w-[50px] flex-col items-center gap-2 rounded-3xl border border-sf-b bg-sf-transparent py-2 text-sf-text-3"
    >
      <template v-for="item in toolbarItems" :key="item.key">
        <div v-if="item.type === 'separator'" class="h-[0.5px] w-full bg-sf-bg-2"></div>
        <component v-else :is="item.component" v-bind="item.attrs" />
      </template>
    </div>
    <!-- QA 解答 -->
    <QaAnswer />
    <!-- 六爻问心：仅调试模式下展示 -->
    <LiuyaoWenxin />
  </div>
</template>

<style scoped></style>
