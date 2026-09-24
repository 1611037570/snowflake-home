<script setup>
import { useResumeStore } from "@/stores";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { defineAsyncComponent } from "vue";
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
  <div class="relative flex items-center overflow-hidden p-3">
    <div
      class="relative flex w-[50px] flex-col items-center gap-2 rounded-3xl border border-sf-b bg-sf-transparent py-2 text-sf-text-3"
    >
      <!-- 简历完成进度：关闭时卸载组件，停止统计计算与数字动画 -->
      <Progress v-if="system.showProgress" />
      <System />
      <Ai />
      <Debug />
      <div class="h-[0.5px] w-full bg-sf-bg-2"></div>
      <ModuleNavigator />
      <CopyResume />
      <Icon icon="lucide:focus" size="5" content="专注模式" @click="enterFocusMode" />
      <div class="h-[0.5px] w-full bg-sf-bg-2"></div>
      <Icon icon="akar-icons:home-alt1" size="5" content="返回首页" @click="goHome" />
      <Icon icon="simple-icons:github" size="5" content="GitHub" @click="goGitHub" />
    </div>
    <!-- QA 解答 -->
    <QaAnswer />
    <!-- 六爻问心：仅调试模式下展示 -->
    <LiuyaoWenxin />
  </div>
</template>

<style scoped></style>
