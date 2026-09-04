<script setup>
import { useRoute, useRouter } from "vue-router";
import { useResumeStatisticsStore } from "@/stores";

// 首次进入自动初始化开始投递日期
const statisticsStore = useResumeStatisticsStore();
statisticsStore.initStartDate();

const route = useRoute();
const router = useRouter();

// 顶部导航配置（对应 /resume 下的子路由）
const navList = [
  { name: "首页", path: "/resume" },
  { name: "简历模板", path: "/resume/template" },
  { name: "我的简历", path: "/resume/mine" },
  { name: "求职统计", path: "/resume/statistics" },
];
// 当前高亮导航，以当前路由路径为准
const activeNavIndex = computed(() => navList.findIndex((item) => route.path === item.path));
</script>

<template>
  <main class="relative flex h-screen min-w-full flex-col bg-sf-page">
    <header
      class="fixed top-0 right-0 left-0 z-50 h-16 w-full border-b-[0.5px] border-sf-b bg-sf-page font-extrabold text-sf-base"
    >
      <div class="mx-auto flex h-full w-full max-w-[1280px] items-center gap-5 px-4">
        <div class="flex shrink-0 items-center gap-2.5 text-[17px] whitespace-nowrap">
          <SfLogo size="8.5" name="resume" />
          <span> {{ $t("router.resume") }}</span>
        </div>

        <nav class="flex items-center gap-5">
          <button
            v-for="(item, index) in navList"
            :key="item.path"
            type="button"
            @click="router.push(item.path)"
            class="cursor-pointer border-0 bg-transparent p-0 text-[15px] font-extrabold"
            :class="
              index === activeNavIndex
                ? `relative text-sf-theme after:absolute after:right-0 after:bottom-[-10px] after:left-0 after:h-[5px] after:rounded-full after:bg-sf-theme after:content-['']`
                : ''
            "
          >
            {{ item.name }}
          </button>
        </nav>

        <div class="ml-auto flex items-center gap-[18px]">
          <SfTheme />
          <SfLocale />
          <SfDonation />
          <SfMore> </SfMore>
        </div>
      </div>
    </header>
    <div
      class="flex h-full w-full flex-1 flex-col overflow-hidden bg-sf-page text-sf-text"
      :class="{ 'pt-20': route.path !== '/resume' }"
    >
      <router-view class="flex-1 overflow-hidden" />
      <SfFooter />
    </div>
  </main>
</template>

<style lang="scss" scoped></style>
