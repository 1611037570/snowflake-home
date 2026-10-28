<script setup>
import { useResumeStatisticsStore, useResumeStore } from "@/stores";
import LoadingComponent from "@views/status/loading.vue";
import { useRoute, useRouter } from "vue-router";
import ResumeHeader from "./components/resumeHeader.vue";
import IssueFeedback from "./components/issueFeedback.vue";
import Share from "./components/share.vue";
import { $t } from "@/locales";

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
    <p>{{ $t("resumeLoadFailed") }}</p>
    <SfButton @click="loadRouteResumes">{{ $t("resumeLoadRetry") }}</SfButton>
    <SfButton plain @click="router.push('/resume')">{{ $t("resumeLoadBackHome") }}</SfButton>
  </section>
  <LoadingComponent v-else-if="!resumeReady" class="h-svh w-full" />
  <router-view v-else-if="route.meta.hideResumeLayout" class="h-screen w-full" />
  <!-- 公开布局就绪标记供构建预渲染等待，不改变页面显示。 -->
  <main v-else :data-prerender-route="route.path" class="relative flex h-screen min-w-full flex-col bg-sf-page">
    <ResumeHeader />
    <!-- 公共布局只补偿固定导航高度，各页面自行控制内容间距。 -->
    <div
      class="flex h-full w-full flex-1 flex-col overflow-hidden bg-sf-page text-sf-text"
      :class="{ 'pt-12': route.path !== '/resume' }"
    >
      <router-view class="flex-1 overflow-hidden" />
      <!-- <SfFooter /> -->
    </div>
  </main>
  <!-- 编辑器由右侧工具轨承接分享与反馈入口，避免重复显示悬浮操作；打印预览页不挂悬浮入口。 -->
  <IssueFeedback
    v-if="
      resumeReady &&
      route.name !== 'resume-print' &&
      route.name !== 'editor'
    "
  />
  <Share
    v-if="
      resumeReady &&
      route.name !== 'resume-print' &&
      route.name !== 'editor'
    "
  />
</template>

<style lang="scss" scoped></style>
