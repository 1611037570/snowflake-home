<script setup>
import { useResumeStore } from "@/stores";
import { useRouter } from "vue-router";
import Ai from "./modules/ai/index.vue";
import System from "./modules/system/index.vue";
import Icon from "./components/icon.vue";
import OnePage from "./modules/onePage.vue";
import Progress from "./modules/progress.vue";
import DesignPreset from "./modules/designPreset.vue";
import ModuleNavigator from "./modules/moduleNavigator.vue";

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
      class="relative flex flex-col items-center gap-2 rounded-3xl border border-sf-b bg-sf-transparent p-2 text-sf-text-3"
    >
      <Progress />
      <System />
      <div class="h-[0.5px] w-full bg-sf-bg-2"></div>
      <DesignPreset />
      <ModuleNavigator />
      <OnePage />
      <Ai />
      <Icon icon="carbon:maximize" size="5" content="专注写作" @click="enterFocusMode" />
      <div class="h-[0.5px] w-full bg-sf-bg-2"></div>
      <Icon icon="akar-icons:home-alt1" size="5" content="返回首页" @click="goHome" />
      <Icon icon="simple-icons:github" size="5" content="GitHub" @click="goGitHub" />
    </div>
  </div>
</template>

<style scoped></style>
