<script setup>
import { useResumeStore } from "@/stores";
import { useRouter } from "vue-router";
import { defineAsyncComponent } from "vue";
import Icon from "./components/icon.vue";

// 工具栏各模块按需分包：独立 chunk 便于缓存，避免全部合并进编辑页主包
const Ai = defineAsyncComponent(() => import("./modules/ai/index.vue"));
const System = defineAsyncComponent(() => import("./modules/system/index.vue"));
const OnePage = defineAsyncComponent(() => import("./modules/onePage.vue"));
const Progress = defineAsyncComponent(() => import("./modules/progress/index.vue"));
const ModuleNavigator = defineAsyncComponent(() => import("./modules/moduleNavigator.vue"));
const QaAnswer = defineAsyncComponent(() => import("./modules/qaAnswer.vue"));
const Debug = defineAsyncComponent(() => import("./modules/debug.vue"));

defineOptions({ name: "ResumeToolbar" });

const router = useRouter();
const resumeStore = useResumeStore();
function goHome() {
  router.push("/resume");
}
function enterFocusMode() {
  resumeStore.setFocusMode(true);
}
function goGitHub() {
  urlNavigation("https://github.com/1611037570/snowflake-home");
}
</script>

<template>
  <div class="relative flex items-center p-3">
    <div
      class="relative flex w-[50px] flex-col items-center gap-2 rounded-3xl border border-sf-b bg-sf-transparent py-2 text-sf-text-3"
    >
      <Progress />
      <System />
      <Debug />
      <div class="h-[0.5px] w-full bg-sf-bg-2"></div>
      <ModuleNavigator />
      <OnePage />
      <Ai />
      <Icon icon="lucide:focus" size="5" content="专注模式" @click="enterFocusMode" />
      <div class="h-[0.5px] w-full bg-sf-bg-2"></div>
      <Icon icon="akar-icons:home-alt1" size="5" content="返回首页" @click="goHome" />
      <Icon icon="simple-icons:github" size="5" content="GitHub" @click="goGitHub" />
    </div>
    <!-- QA 解答 -->
    <QaAnswer />
  </div>
</template>

<style scoped></style>
