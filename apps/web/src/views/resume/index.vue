<script setup>
import { useResumeStatisticsStore, useResumeStore } from "@/stores";
import LoadingComponent from "@views/status/loading.vue";
import { useRoute, useRouter } from "vue-router";
import ResumeHeader from "./components/resumeHeader.vue";
import IssueFeedback from "./components/issueFeedback.vue";
import Share from "./components/share.vue";

const route = useRoute();
const router = useRouter();
const resumeStore = useResumeStore();
const resumeReady = ref(false);
// 当前路由读取失败时提供重试，避免停留在无限加载状态
const resumeLoadError = ref(false);

let resumeLoadSequence = 0;
const loadRouteResumes = async () => {
  const sequence = ++resumeLoadSequence;
  resumeReady.value = false;
  resumeLoadError.value = false;
  try {
    await resumeStore.init();
    if (route.path === "/resume/editor" || route.path === "/resume/print") {
      await resumeStore.loadResume(String(route.query.id || ""));
    } else if (route.path === "/resume/mine") {
      await resumeStore.loadActiveResumes();
    }
  } catch (error) {
    // 旧路由的失败不覆盖当前路由状态，也不把未加载内容交给编辑器
    if (sequence === resumeLoadSequence) resumeLoadError.value = true;
    console.error("简历读取失败：", error);
  } finally {
    if (sequence === resumeLoadSequence) resumeReady.value = true;
  }
};
watch(() => [route.path, route.query.id], loadRouteResumes, { immediate: true });

// 首次进入自动初始化开始投递日期
const statisticsStore = useResumeStatisticsStore();
// 编辑器使用独立页头，不初始化简历导航页的统计状态。
if (!route.meta.hideResumeLayout) statisticsStore.initStartDate();

</script>

<template>
  <section v-if="resumeLoadError" class="flex-c h-svh w-full flex-col gap-3 bg-sf-page text-sf-text">
    <p>简历读取失败，请稍后重试</p>
    <SfButton @click="loadRouteResumes">重新读取</SfButton>
    <SfButton plain @click="router.push('/resume')">返回简历首页</SfButton>
  </section>
  <LoadingComponent v-else-if="!resumeReady" class="h-svh w-full" />
  <router-view v-else-if="route.meta.hideResumeLayout" class="h-screen w-full" />
  <main v-else class="relative flex h-screen min-w-full flex-col bg-sf-page">
    <ResumeHeader />
    <div
      class="flex h-full w-full flex-1 flex-col overflow-hidden bg-sf-page text-sf-text"
      :class="{ 'pt-16': route.path !== '/resume' }"
    >
      <router-view class="flex-1 overflow-hidden" />
      <!-- <SfFooter /> -->
    </div>
  </main>
  <IssueFeedback v-if="resumeReady && route.name !== 'resume-print'" />
  <Share v-if="resumeReady && route.name !== 'resume-print'" />
</template>

<style lang="scss" scoped></style>
