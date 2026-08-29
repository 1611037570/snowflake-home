<script setup>
import { useRouter } from "vue-router";
import Ai from "./modules/ai/index.vue";
import System from "./modules/system/index.vue";
import Icon from "./components/icon.vue";
import ImportResume from "./modules/importResume.vue";
import ExportResume from "./modules/exportResume.vue";
import OnePage from "./modules/onePage.vue";
import Progress from "./modules/progress.vue";
import BrowserTip from "./modules/browserTip.vue";
import DesignPreset from "./modules/designPreset.vue";

defineOptions({ name: "ResumeToolbar" });

const router = useRouter();
function goHome() {
  router.push("/resume");
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
      <ExportResume />
      <OnePage />
      <ImportResume />
      <Ai />
      <div class="h-[0.5px] w-full bg-sf-bg-2"></div>
      <BrowserTip />
      <Icon icon="akar-icons:home-alt1" size="5" content="返回首页" @click="goHome" />
      <Icon icon="simple-icons:github" size="5" content="GitHub" @click="goGitHub" />
    </div>
  </div>
</template>

<style scoped></style>
