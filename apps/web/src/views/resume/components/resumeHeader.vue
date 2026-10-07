<script setup>
import { computed, ref, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";
import ProjectTitle from "./projectTitle.vue";

const route = useRoute();
const router = useRouter();
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
];
// 当前高亮导航，以当前路由路径为准。
const activeNavIndex = computed(() => navList.findIndex((item) => route.path === item.path));

// 选择导航后关闭抽屉，包括再次点击当前页面。
const navigate = (path) => {
  drawerVisible.value = false;
  router.push(path);
};

// 路由切换或恢复桌面宽度时收起移动导航。
watch([() => route.path, isMobile], () => {
  drawerVisible.value = false;
});
</script>

<template>
  <header
    class="fixed top-0 right-0 left-0 z-50 h-12 w-full rounded-b-3xl border-b-[0.5px] border-sf-b bg-sf-primary font-extrabold text-sf-base"
  >
    <div class="mx-auto flex h-full w-full max-w-7xl items-center gap-3 px-3">
      <!-- 移动端左侧显示三横线导航入口，右侧保留功能按钮。 -->
      <button
        type="button"
        class="flex h-9 w-9 cursor-pointer flex-col items-center justify-evenly text-sf-text md:hidden"
        aria-label="打开导航"
        :aria-expanded="drawerVisible"
        @click="drawerVisible = true"
      >
        <span class="h-0.5 w-6 rounded-full bg-current"></span>
        <span class="h-0.5 w-6 rounded-full bg-current"></span>
        <span class="h-0.5 w-6 rounded-full bg-current"></span>
      </button>

      <ProjectTitle class="hidden md:flex" url="/resume" />

      <nav class="hidden min-w-0 items-center gap-3 md:flex">
        <SfSpan
          v-for="(item, index) in navList"
          :key="item.path"
          class="h-9 shrink-0 cursor-pointer text-[16px]"
          :active="index === activeNavIndex"
          :underline-height="1"
          @click="navigate(item.path)"
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

  <!-- 抽屉从左向右展开，展示与桌面一致的导航入口。 -->
  <el-drawer
    v-model="drawerVisible"
    title="导航"
    direction="ltr"
    size="min(80vw, 20rem)"
    append-to-body
    destroy-on-close
  >
    <nav class="flex flex-col gap-3 text-sf-text">
      <button
        v-for="(item, index) in navList"
        :key="item.path"
        type="button"
        class="cursor-pointer rounded-xl px-3 py-3 text-left font-bold hover:bg-sf-bg-hover"
        :class="index === activeNavIndex ? 'bg-sf-theme-3 text-sf-theme' : ''"
        :aria-current="index === activeNavIndex ? 'page' : undefined"
        @click="navigate(item.path)"
      >
        {{ $t(item.key) }}
      </button>
    </nav>
  </el-drawer>
</template>
