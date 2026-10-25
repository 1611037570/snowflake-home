<script setup>
import { computed, ref, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useRoute } from "vue-router";
import ProjectTitle from "./projectTitle.vue";
import GithubStars from "./githubStars.vue";

const route = useRoute();
const drawerVisible = ref(false);
const isMobile = useMediaQuery("(max-width: 767px)");

// 桌面顶部与移动抽屉共用导航配置。
const navList = [
  {
    key: "resumeNavHome", // 导航文案标识
    path: "/resume", // 导航目标路径
  },
  {
    key: "resumeNavTemplates", // 导航文案标识
    path: "/resume/template", // 导航目标路径
  },
  {
    key: "resumeNavMyResumes", // 导航文案标识
    path: "/resume/mine", // 导航目标路径
  },
  {
    key: "resumeNavAi", // 导航文案标识
    path: "/resume/ai", // 导航目标路径
  },
  {
    key: "resumeNavStatistics", // 导航文案标识
    path: "/resume/statistics", // 导航目标路径
  },
  {
    key: "resumeNavGuide", // 导航文案标识
    path: "/resume/guide", // 导航目标路径
  },
  {
    key: "resumeNavSettings", // 导航文案标识
    path: "/resume/settings", // 导航目标路径
  },
];
// 当前高亮导航，以当前路由路径为准。
const activeNavIndex = computed(() => navList.findIndex((item) => route.path === item.path));

// 路由切换或恢复桌面宽度时收起移动导航。
watch([() => route.path, isMobile], () => {
  drawerVisible.value = false;
});
</script>

<template>
  <header
    class="fixed top-0 right-0 left-0 z-50 h-12 w-full border-b-[0.5px] border-sf-b bg-sf-primary font-extrabold text-sf-base"
    x
  >
    <div class="mx-auto flex h-full w-full max-w-7xl items-center gap-3 px-3">
      <!-- 移动端左侧显示三横线导航入口，右侧保留功能按钮。 -->
      <button
        type="button"
        class="flex h-9 w-9 cursor-pointer flex-col items-center justify-evenly text-sf-text md:hidden"
        :aria-label="$t('resumeNavOpen')"
        :aria-expanded="drawerVisible"
        @click="drawerVisible = true"
      >
        <span class="h-0.5 w-6 rounded-full bg-current"></span>
        <span class="h-0.5 w-6 rounded-full bg-current"></span>
        <span class="h-0.5 w-6 rounded-full bg-current"></span>
      </button>

      <ProjectTitle class="hidden md:flex" url="/resume" />

      <nav class="hidden min-w-0 items-center gap-3 md:flex">
        <!-- 使用 router-link 渲染为真实 a 标签，便于搜索引擎抓取站内链接 -->
        <router-link
          v-for="(item, index) in navList"
          :key="item.path"
          :to="item.path"
          class="shrink-0"
        >
          <SfSpan
            class="h-9 cursor-pointer text-[16px]"
            :active="index === activeNavIndex"
            :underline-height="1"
          >
            {{ $t(item.key) }}
          </SfSpan>
        </router-link>
      </nav>

      <div class="ml-auto flex shrink-0 items-center gap-3">
        <GithubStars />
        <SfTheme />
        <SfLocale />
        <SfDonation />
      </div>
    </div>
  </header>

  <!-- 抽屉从左向右展开，展示与桌面一致的导航入口。 -->
  <el-drawer
    v-model="drawerVisible"
    :title="$t('resumeNavTitle')"
    direction="ltr"
    size="min(80vw, 20rem)"
    append-to-body
    destroy-on-close
  >
    <nav class="flex flex-col gap-3 text-sf-text">
      <!-- 使用 router-link 渲染为真实 a 标签，便于搜索引擎抓取站内链接 -->
      <router-link
        v-for="(item, index) in navList"
        :key="item.path"
        :to="item.path"
        class="hover:bg-sf-bg-hover cursor-pointer rounded-xl px-3 py-3 text-left font-bold"
        :class="index === activeNavIndex ? 'bg-sf-theme-3 text-sf-theme' : ''"
        :aria-current="index === activeNavIndex ? 'page' : undefined"
        @click="drawerVisible = false"
      >
        {{ $t(item.key) }}
      </router-link>
    </nav>
  </el-drawer>
</template>
