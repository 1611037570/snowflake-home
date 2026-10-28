<script setup>
import { computed, ref, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useRoute } from "vue-router";
import ProjectTitle from "./projectTitle.vue";
import GithubStars from "./githubStars.vue";

const route = useRoute();
const drawerVisible = ref(false);
// 完整导航需要足够横向空间，中等屏幕继续使用抽屉入口。
const isMobile = useMediaQuery("(max-width: 1279px)");

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
    key: "resumeNavTools", // 导航文案标识
    path: "/resume/tools", // 导航目标路径
  },
  {
    key: "resumeNavSettings", // 导航文案标识
    path: "/resume/settings", // 导航目标路径
  },
];
// 子页面沿用所属导航的选中态，首页只匹配自身路径。
const activeNavIndex = computed(() => {
  const currentPath = route.path.replace(/\/+$/, "");
  return navList.findIndex((item) =>
    currentPath === item.path ||
    (item.path !== "/resume" && currentPath.startsWith(`${item.path}/`)),
  );
});

// 路由切换或恢复桌面宽度时收起移动导航。
watch([() => route.path, isMobile], () => {
  drawerVisible.value = false;
});
</script>

<template>
  <header
    class="fixed top-0 right-0 left-0 z-50 h-12 w-full border-b-[0.5px] border-sf-b bg-sf-primary text-sf-text"
    x
  >
    <div class="mx-auto flex h-full w-full max-w-7xl items-center gap-3 px-3 sm:px-6 xl:gap-6">
      <!-- 移动端左侧显示三横线导航入口，右侧保留功能按钮。 -->
      <button
        type="button"
        class="flex h-9 w-9 shrink-0 cursor-pointer flex-col items-center justify-center gap-[6px] rounded-md text-sf-text-2 transition-colors hover:bg-sf-bg hover:text-sf-text xl:hidden"
        :aria-label="$t('resumeNavOpen')"
        :aria-expanded="drawerVisible"
        @click="drawerVisible = true"
      >
        <span class="h-px w-[18px] rounded-full bg-current"></span>
        <span class="h-px w-[18px] rounded-full bg-current"></span>
        <span class="h-px w-[18px] rounded-full bg-current"></span>
      </button>

      <!-- 品牌保持静态，移动端也保留标识，文字仍沿用组件的响应式显示。 -->
      <ProjectTitle
        class="flex shrink-0 [&_.animate-pulse]:animate-none [&_a]:gap-3 [&_a]:rounded-none [&_a]:px-0 [&_a]:hover:bg-transparent [&_a>span]:font-semibold [&_a>span]:tracking-normal"
        url="/resume"
      />

      <!-- 菜单占据中间区域，短下划线与文字居中对齐。 -->
      <nav class="hidden h-full min-w-0 flex-1 items-center justify-center gap-6 overflow-x-auto xl:flex" :aria-label="$t('resumeNavTitle')">
        <!-- 使用 router-link 渲染为真实 a 标签，便于搜索引擎抓取站内链接 -->
        <router-link
          v-for="(item, index) in navList"
          :key="item.path"
          :to="item.path"
          class="relative inline-flex h-full shrink-0 items-center whitespace-nowrap text-sm transition-colors after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-6 after:-translate-x-1/2 after:rounded-full after:bg-sf-theme after:transition-opacity focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-sf-theme"
          :class="index === activeNavIndex ? 'font-medium text-sf-theme after:opacity-100' : 'font-normal text-sf-text-2 after:opacity-0 hover:text-sf-text'"
          :aria-current="index === activeNavIndex ? 'page' : undefined"
        >
          {{ $t(item.key) }}
        </router-link>
      </nav>

      <!-- 工具统一点击区域与悬停底色，窄屏收紧间距，弹出内容保持原始尺寸。 -->
      <div class="ml-auto flex shrink-0 items-center gap-[3px] border-l border-sf-b pl-3 sm:gap-3 [&_[data-sf-icon-state]]:scale-75!">
        <GithubStars class="rounded-lg hover:bg-sf-bg" />
        <SfTheme class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-sf-bg" />
        <SfLocale class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-sf-bg" />
        <SfDonation class="h-9 w-9 justify-center rounded-lg transition-colors hover:bg-sf-bg" />
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
        class="relative flex cursor-pointer items-center rounded-lg px-6 py-3 text-left text-sm transition-colors before:absolute before:top-3 before:bottom-3 before:left-0 before:w-0.5 before:rounded-full before:bg-sf-theme hover:bg-sf-bg"
        :class="index === activeNavIndex ? 'bg-sf-theme-3 font-medium text-sf-theme before:opacity-100' : 'font-normal text-sf-text-2 before:opacity-0'"
        :aria-current="index === activeNavIndex ? 'page' : undefined"
        @click="drawerVisible = false"
      >
        {{ $t(item.key) }}
      </router-link>
    </nav>
  </el-drawer>
</template>
