<script setup>
import { computed, ref, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useRoute } from "vue-router";
import ProjectTitle from "./projectTitle.vue";
import GithubStars from "./githubStars.vue";

const route = useRoute();
const drawerVisible = ref(false);
// 窄屏使用抽屉，桌面固定显示紧凑侧栏。
const isMobile = useMediaQuery("(max-width: 767px)");

// 桌面侧栏与移动抽屉共用分组导航：简历入口、AI 能力、求职与设置。
const navGroups = [
  {
    key: "", // 首组不展示分组标题，直接陈列简历入口。
    items: [
      {
        key: "resumeNavTemplates", // 导航文案标识
        path: "/resume/template", // 导航目标路径
        icon: "lucide:layout-template", // 模板导航图标。
      },
      {
        key: "resumeNavMyResumes", // 导航文案标识
        path: "/resume/mine", // 导航目标路径
        icon: "mdi:file-document-outline", // 我的简历导航图标。
      },
    ],
  },
  {
    key: "resumeNavGroupAi", // 分组标题文案标识
    items: [
      {
        key: "resumeNavAiGenerate", // AI 生成入口文案标识。
        path: "/resume/generate", // 独立生成页面，与新建入口共用同一套流程。
        icon: "lucide:wand-sparkles", // AI 生成导航图标。
      },
      {
        key: "resumeNavInterview", // 面试栏目文案标识。
        path: "/resume/interview", // 独立面试训练页面。
        icon: "ph:microphone-duotone", // 面试训练图标。
      },
      {
        key: "resumeNavAi", // 导航文案标识
        path: "/resume/ai", // 导航目标路径
        icon: "lucide:sparkles", // 人工智能导航图标。
      },
    ],
  },
  {
    key: "resumeNavGroupJob", // 分组标题文案标识
    items: [
      {
        key: "resumeNavStatistics", // 导航文案标识
        path: "/resume/statistics", // 导航目标路径
        icon: "fa-solid:chart-line", // 统计导航图标。
      },
      {
        key: "resumeNavGuide", // 导航文案标识
        path: "/resume/guide", // 导航目标路径
        icon: "mdi:book-open-page-variant", // 求职指南导航图标。
      },
      {
        key: "resumeNavTools", // 导航文案标识
        path: "/resume/tools", // 导航目标路径
        icon: "mdi:hammer-wrench", // 求职工具导航图标。
      },
      {
        key: "resumeNavSettings", // 导航文案标识
        path: "/resume/settings", // 导航目标路径
        icon: "lucide:sliders-horizontal", // 设置导航图标。
      },
    ],
  },
];
// 展平分组后判断选中项，子页面沿用所属导航入口。
const navItems = computed(() => navGroups.flatMap((group) => group.items));
const activeNavPath = computed(() => {
  const currentPath = route.path.replace(/\/+$/, "");
  const matched = navItems.value.find((item) =>
    currentPath === item.path ||
    (item.path !== "/resume" && currentPath.startsWith(`${item.path}/`)),
  );
  return matched?.path ?? "";
});
const isActive = (item) => item.path === activeNavPath.value;

// 路由切换或恢复桌面宽度时收起移动导航。
watch([() => route.path, isMobile], () => {
  drawerVisible.value = false;
});
</script>

<template>
  <!-- 桌面侧栏宽度随内容撑开，导航滚动与底部功能区分开。 -->
  <aside class="relative z-50 hidden h-full w-fit shrink-0 flex-col border-r border-sf-b bg-sf-primary text-sf-text md:flex">
    <!-- 品牌区与顶部栏同高，标识在整条内居中，保留组件自带的圆角悬停底色。 -->
    <ProjectTitle
      class="flex h-12 shrink-0 items-center justify-center border-b border-sf-b px-3 [&_.animate-pulse]:animate-none [&_a]:gap-3 [&_a>span]:font-semibold [&_a>span]:tracking-normal"
      url="/resume"
    />
    <!-- 按功能分组陈列，组标题用说明文字区分层次，条目保持紧凑居中。 -->
    <nav class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3" :aria-label="$t('resumeNavTitle')">
      <div
        v-for="group in navGroups"
        :key="group.key || group.items[0].path"
        class="flex flex-col gap-[3px]"
      >
        <p v-if="group.key" class="px-3 text-xs font-medium text-sf-text-3">{{ $t(group.key) }}</p>
        <router-link
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          class="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-sf-theme"
          :class="isActive(item) ? 'bg-sf-bg font-medium text-sf-text' : 'text-sf-text-2 hover:bg-sf-bg hover:text-sf-text'"
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          <!-- 图标与文字保持小于品牌区，条目靠左排列，仅品牌标识居中。 -->
          <SfIcon :icon="item.icon" size="4" box-size="5" class="shrink-0 text-inherit!" />
          <span class="min-w-0 break-words">{{ $t(item.key) }}</span>
        </router-link>
      </div>
    </nav>
    <!-- 完整交互区域继续由图标盒子承接，功能按钮统一放在侧栏底部，由两端对齐分配间距。 -->
    <footer class="flex shrink-0 items-center justify-between border-t border-sf-b p-3">
      <GithubStars size="5" :box-size="9" class="rounded-lg" />
      <SfTheme size="5" :box-size="9" class="flex h-9 w-9 items-center justify-center" />
      <SfLocale size="5" :box-size="9" class="flex h-9 w-9 items-center justify-center" />
      <SfDonation size="5" :box-size="9" class="h-9 w-9 cursor-pointer justify-center" />
    </footer>
  </aside>

  <!-- 移动端仅保留导航入口和品牌，功能按钮随抽屉移至底部。 -->
  <header class="fixed inset-x-0 top-0 z-50 flex h-12 items-center gap-3 border-b border-sf-b bg-sf-primary px-3 text-sf-text md:hidden">
    <button
      type="button"
      class="flex h-9 w-9 shrink-0 cursor-pointer flex-col items-center justify-center gap-[6px] rounded-md text-sf-text-2 transition-colors hover:bg-sf-bg hover:text-sf-text"
      :aria-label="$t('resumeNavOpen')"
      :aria-expanded="drawerVisible"
      @click="drawerVisible = true"
    >
      <span class="h-px w-[18px] rounded-full bg-current"></span>
      <span class="h-px w-[18px] rounded-full bg-current"></span>
      <span class="h-px w-[18px] rounded-full bg-current"></span>
    </button>
    <ProjectTitle class="flex [&_.animate-pulse]:animate-none [&_a]:gap-3 [&_a]:px-0 [&_a>span]:flex" url="/resume" />
  </header>

  <el-drawer
    v-model="drawerVisible"
    :title="$t('resumeNavTitle')"
    direction="ltr"
    size="min(80vw, 216px)"
    :body-class="'p-3!'"
    :header-class="'m-0! p-3!'"
    :footer-class="'border-t border-sf-b p-3!'"
    append-to-body
    destroy-on-close
  >
    <nav class="flex flex-col gap-3 text-sf-text">
      <div
        v-for="group in navGroups"
        :key="group.key || group.items[0].path"
        class="flex flex-col gap-[6px]"
      >
        <p v-if="group.key" class="px-3 text-xs font-medium text-sf-text-3">{{ $t(group.key) }}</p>
        <router-link
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 rounded-lg p-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-sf-theme"
          :class="isActive(item) ? 'bg-sf-bg font-medium text-sf-text' : 'text-sf-text-2 hover:bg-sf-bg hover:text-sf-text'"
          :aria-current="isActive(item) ? 'page' : undefined"
          @click="drawerVisible = false"
        >
          <SfIcon :icon="item.icon" size="5" box-size="6" class="shrink-0 text-inherit!" />
          <span class="min-w-0 break-words">{{ $t(item.key) }}</span>
        </router-link>
      </div>
    </nav>
    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <GithubStars size="5" :box-size="9" class="rounded-lg" />
        <SfTheme size="5" :box-size="9" class="flex h-9 w-9 items-center justify-center" />
        <SfLocale size="5" :box-size="9" class="flex h-9 w-9 items-center justify-center" />
        <SfDonation size="5" :box-size="9" class="h-9 w-9 cursor-pointer justify-center" />
      </div>
    </template>
  </el-drawer>
</template>
