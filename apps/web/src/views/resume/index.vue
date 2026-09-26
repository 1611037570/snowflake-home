<script setup>
import { useResumeStatisticsStore, useResumeStore } from "@/stores";
import LoadingComponent from "@views/status/loading.vue";
import { useRoute, useRouter } from "vue-router";
import ProjectTitle from "./components/projectTitle.vue";

const route = useRoute();
const router = useRouter();
const resumeStore = useResumeStore();
const resumeReady = ref(false);

// 仅在进入简历模块时加载简历数据，避免阻塞其他模块启动。
void resumeStore.init().then(() => {
  resumeReady.value = true;
});

// 首次进入自动初始化开始投递日期
const statisticsStore = useResumeStatisticsStore();
// 编辑器使用独立页头，不初始化简历导航页的统计状态。
if (!route.meta.hideResumeLayout) statisticsStore.initStartDate();

// 顶部导航配置（对应 /resume 下的子路由）
const navList = [
  { key: "resumeNavHome", path: "/resume" },
  { key: "resumeNavTemplates", path: "/resume/template" },
  { key: "resumeNavMyResumes", path: "/resume/mine" },
  { key: "resumeNavAi", path: "/resume/ai" },
  { key: "resumeNavStatistics", path: "/resume/statistics" },
];
// 当前高亮导航，以当前路由路径为准
const activeNavIndex = computed(() => navList.findIndex((item) => route.path === item.path));
</script>

<template>
  <LoadingComponent v-if="!resumeReady" class="h-svh w-full" />
  <router-view v-else-if="route.meta.hideResumeLayout" class="h-screen w-full" />
  <main v-else class="relative flex h-screen min-w-full flex-col bg-sf-page">
    <header
      class="fixed top-0 right-0 left-0 z-50 h-12 w-full rounded-b-3xl border-b-[0.5px] border-sf-b bg-sf-primary font-extrabold text-sf-base"
    >
      <div class="mx-auto flex h-full w-full max-w-7xl items-center gap-3 px-3 sm:gap-5 sm:px-4">
        <ProjectTitle url="/resume" />

        <nav class="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto sm:flex-none sm:gap-5">
          <SfSpan
            v-for="(item, index) in navList"
            :key="item.path"
            class="h-9 shrink-0 cursor-pointer text-[12px] sm:text-[16px]"
            :active="index === activeNavIndex"
            :underline-height="1"
            @click="router.push(item.path)"
          >
            {{ $t(item.key) }}
          </SfSpan>
        </nav>

        <div class="ml-auto flex shrink-0 items-center gap-3">
          <SfTheme />
          <SfLocale />
          <SfDonation />
        </div>
      </div>
    </header>
    <div
      class="flex h-full w-full flex-1 flex-col overflow-hidden bg-sf-page text-sf-text"
      :class="{ 'pt-16': route.path !== '/resume' }"
    >
      <router-view class="flex-1 overflow-hidden" />
      <!-- <SfFooter /> -->
    </div>
  </main>
</template>

<style lang="scss" scoped></style>
