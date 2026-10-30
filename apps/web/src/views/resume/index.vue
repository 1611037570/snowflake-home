<script setup>
import { useResumeStatisticsStore, useResumeStore } from "@/stores";
import LoadingComponent from "@views/status/loading.vue";
import { useRoute, useRouter } from "vue-router";
import ResumeHeader from "./components/resumeHeader.vue";
import HomeNavigation from "./main/homeNavigation.vue";
import IssueFeedback from "./components/issueFeedback.vue";
import Share from "./components/share.vue";
import { $t } from "@/locales";
import { defineAsyncComponent, onBeforeUnmount, onMounted } from "vue";
import eventBus from "@/utils/modules/eventBus";

// 只有编辑器内的一键优化使用弹窗，其余入口统一到优化页内嵌展开。
const AiResumeOptimizer = defineAsyncComponent(() => import("./components/aiResumeOptimizer.vue"));
const optimizerVisible = ref(false);
const optimizationResumeId = ref("");
const openOptimizer = (resumeId) => {
  if (optimizerVisible.value || resumeStore.isGenerating) return;
  const id = typeof resumeId === "string" && resumeId ? resumeId : resumeStore.currentItem?.id;
  // 非编辑器页面没有可覆盖的编辑区，直接跳到优化页，避开弹窗形态。
  if (route.name !== "editor") {
    router.push({ path: "/resume/optimize", query: id ? { id } : {} });
    return;
  }
  if (!id) return;
  optimizationResumeId.value = id;
  optimizerVisible.value = true;
};
onMounted(() => eventBus.on("resume-open-optimize", openOptimizer));
onBeforeUnmount(() => eventBus.off("resume-open-optimize", openOptimizer));

const route = useRoute();
// 忽略地址末尾斜杠，首页导航与内容占位使用同一判断。
const isResumeHome = computed(() => route.path.replace(/\/+$/, "") === "/resume");
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
// 离开当前页面时卸载任务，停止旧请求并丢弃尚未写入的副本。
watch(() => [route.path, route.query.id], () => { optimizerVisible.value = false; });

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
    <!-- 首页使用独立顶部导航，保持全宽。 -->
    <template v-if="isResumeHome">
      <HomeNavigation />
      <div class="flex h-full min-w-0 w-full flex-1 flex-col overflow-hidden bg-sf-page text-sf-text">
        <router-view class="flex-1 overflow-hidden" />
        <!-- <SfFooter /> -->
      </div>
    </template>
    <!-- 工作区由侧栏与内容并排撑开，侧栏宽度跟随内容，窄屏顶部入口在内容上留出高度。 -->
    <div v-else class="flex min-h-0 flex-1 overflow-hidden bg-sf-page text-sf-text">
      <ResumeHeader />
      <div class="flex min-w-0 flex-1 flex-col overflow-hidden pt-12 md:pt-0">
        <router-view class="flex-1 overflow-hidden" />
        <!-- <SfFooter /> -->
      </div>
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
  <AiResumeOptimizer
    v-if="optimizerVisible"
    v-model="optimizerVisible"
    :resume-id="optimizationResumeId"
  />
</template>

<style lang="scss" scoped></style>
