<template>
  <SfScrollbar class="h-full bg-sf-page" flush>
    <main class="resume-home relative w-full shrink-0 overflow-hidden bg-sf-page text-sf-text">
      <section
        class="resume-home__hero relative mx-auto grid max-w-[1440px] items-center gap-x-12 gap-y-12 px-6 pt-24 pb-12 sm:pb-32 lg:min-h-screen lg:grid-cols-2 lg:px-12"
      >
        <article class="relative z-10 mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <!-- 首页主标题承接开源、免费、AI 生成简历的检索词，浏览器标题仍由 site.config 控制 -->
          <h1
            class="animate-rise animate-rise--delay-one text-4xl leading-[1.15] font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl"
          >
            {{ $t("resumeHomeHeroTitle") }}
          </h1>
          <!-- 副标题说明 AI 承担哪几步，以及导出能力与免费事实 -->
          <p class="animate-rise animate-rise--delay-two mt-6 text-base font-medium text-sf-text-2">
            {{ $t("resumeHomeHeroSubtitle") }}
          </p>
          <div
            class="animate-rise animate-rise--delay-three mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <router-link
              to="/resume/template"
              class="group inline-flex cursor-pointer items-center justify-center gap-3 rounded-full bg-sf-theme px-6 py-3 font-semibold text-sf-theme-text transition-transform duration-300 hover:-translate-y-1"
            >
              {{ $t("resumeHomeCreateFree") }}
              <SfIcon
                icon="mingcute:arrow-right-line"
                size="4"
                class="transition-transform duration-300 group-hover:translate-x-1"
              />
            </router-link>
            <!-- 页面滚动发生在内部滚动容器里，原生锚点无效，改为主动滚动到首屏下方的编辑器截图 -->
            <button
              type="button"
              class="inline-flex cursor-pointer items-center justify-center gap-3 rounded-full border border-sf-b bg-sf-primary px-6 py-3 font-semibold transition-colors duration-300 hover:bg-sf-bg"
              @click="scrollToEditor"
            >
              {{ $t("resumeHomeEditorCta") }}
              <SfIcon icon="mingcute:arrow-down-line" size="4" />
            </button>
          </div>
          <!-- 首屏关键点：把用户最先关心的能力直接摊开 -->
          <ul
            class="animate-rise animate-rise--delay-three mt-6 flex flex-wrap justify-center gap-3 lg:justify-start"
          >
            <li
              v-for="point in keyPoints"
              :key="point"
              class="rounded-full bg-sf-bg-2 px-3 py-3 text-xs font-medium text-sf-text-2"
            >
              {{ point }}
            </li>
          </ul>
          <!-- 首屏指标：数字在上、标签在下，内容水平垂直居中 -->
          <dl
            class="animate-rise animate-rise--delay-three mt-9 grid grid-cols-3 gap-3 border-t border-sf-b pt-6 sm:grid-cols-5"
          >
            <div
              v-for="(stat, index) in headlineStats"
              :key="stat.label"
              class="flex flex-col items-center justify-center text-center"
            >
              <dt class="flex flex-col items-center gap-1">
                <span class="text-2xl font-black text-sf-theme">{{
                  stat.display ?? Math.round(animatedHeadlineStats[index])
                }}</span>
                <span class="text-xs font-medium text-sf-text-2">{{ stat.label }}</span>
              </dt>
            </div>
          </dl>
        </article>

        <!-- 右侧：真实简历预览，替换原占位截图区；示例简历是假数据，禁止搜索引擎把它当成页面正文抓进摘要 -->
        <div class="relative mx-auto w-full max-w-[380px]" data-nosnippet>
          <!-- 首屏简历展示与翻页切换 -->
          <HeroSwitcher :items="heroSwitcherItems" @change="handleHeroChange">
            <!-- 鼠标经过简历时浮出的创建入口，点击用当前范本直接创建简历；层级需高于叠放卡片才能显示与点击 -->
            <div
              class="pointer-events-none absolute inset-x-0 bottom-1/4 z-10 flex justify-center opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100"
            >
              <button
                type="button"
                class="inline-flex cursor-pointer items-center gap-1 rounded-full bg-sf-theme px-2 py-1 text-[12px] text-white"
                @click="createFromHeroPreview"
              >
                <SfIcon icon="lucide:wand-sparkles" size="4" />
                {{ $t("resumeHomeUseTemplate") }}
              </button>
            </div>
          </HeroSwitcher>
          <!-- 在线写作氛围：置于简历切换区下方，进入首屏时抽取一次在线人数 -->
          <OnlineWriters class="animate-rise animate-rise--delay-two mt-3 text-center" />
        </div>
      </section>

      <!-- 编辑器截图：向上负边距让截图顶部露在首屏底边，继续滚动才完整展开；说明放在图下，不占首屏 -->
      <figure
        id="editor-shot"
        class="relative mx-auto -mt-9 max-w-[1440px] scroll-mt-16 px-6 sm:-mt-24 lg:px-12"
      >
        <!-- 展示框按视口高度同步收缩，为标题栏和切换按钮留出空间。 -->
        <div class="resume-home__editor-showcase mx-auto w-full overflow-hidden rounded-3xl border border-sf-b bg-sf-primary">
          <div class="flex items-center gap-[6px] border-b border-sf-b px-3 py-[6px]">
            <!-- 窗口圆点使用红黄绿主题色，增强展示框的识别度。 -->
            <span class="h-[6px] w-[6px] rounded-full bg-sf-error"></span>
            <span class="h-[6px] w-[6px] rounded-full bg-sf-warning"></span>
            <span class="h-[6px] w-[6px] rounded-full bg-sf-success"></span>
            <span class="text-xs font-medium text-sf-text-2">{{ activeEditorShowcase.label }}</span>
          </div>
          <!-- 沿用编辑器截图原有高度，其余截图强制铺满同一画布。 -->
          <div class="relative aspect-[2117/1398] w-full bg-sf-b">
            <img
              v-if="activeEditorShowcase.image"
              :src="activeEditorShowcase.image"
              :alt="activeEditorShowcase.label"
              width="2117"
              height="1398"
              decoding="async"
              class="absolute inset-0 block h-full w-full object-fill"
            />
            <!-- 未配置截图时占用同一画布，避免占位与图片高度不一致。 -->
            <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-sf-bg text-center">
              <span class="text-xl font-semibold text-sf-text">{{ activeEditorShowcase.label }}</span>
              <span class="text-sm text-sf-text-2">{{ $t("resumeHomeShotPlaceholder") }}</span>
            </div>
          </div>
        </div>
        <!-- 图下仅保留紧凑的切换按钮，避免重复说明占用展示高度。 -->
        <div class="mt-3 flex flex-wrap justify-center gap-3">
          <button
            v-for="(item, index) in editorShowcaseItems"
            :key="item.label"
            type="button"
            class="inline-flex h-8 cursor-pointer items-center justify-center rounded-full border px-3 text-xs font-medium transition-colors"
            :class="index === activeEditorShowcaseIndex ? 'border-sf-theme bg-sf-theme text-sf-theme-text' : 'border-sf-b bg-sf-primary text-sf-text-2 hover:border-sf-theme'"
            :aria-pressed="index === activeEditorShowcaseIndex"
            @click="activeEditorShowcaseIndex = index"
          >
            {{ item.label }}
          </button>
        </div>
      </figure>

      <section
        id="journey"
        :ref="registerRevealSection"
        class="resume-home__reveal relative mx-auto flex max-w-[1440px] scroll-mt-16 flex-col justify-center px-6 py-12 lg:px-12 lg:py-18"
      >
        <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div class="max-w-2xl">
            <p class="text-sm font-semibold tracking-[0.18em] text-sf-theme">
              {{ $t("resumeHomeJourneyEyebrow") }}
            </p>
            <h2 class="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              {{ $t("resumeHomeJourneyTitle") }}
            </h2>
          </div>
        </div>
        <!-- 并列展示求职各阶段，方便快速比较功能 -->
        <div class="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="(group, index) in featureGroups"
            :id="group.id"
            :key="group.id"
            class="resume-home__journey-card flex h-full flex-col rounded-[21px] border border-sf-b bg-sf-primary p-6 transition-colors duration-300 hover:border-sf-theme"
          >
            <!-- 序号与名称并排，压缩卡片标题空间 -->
            <div class="flex items-center gap-3">
              <span class="text-sm font-black text-sf-theme">0{{ index + 1 }}</span>
              <h3 class="text-xl font-bold tracking-[-0.02em]">{{ group.eyebrow }}</h3>
            </div>
            <p class="mt-3 font-medium leading-7 text-sf-text">{{ group.description }}</p>
            <ul class="mt-3 grid gap-3">
              <li
                v-for="item in group.items"
                :key="item"
                class="text-sm leading-6 text-sf-text-2"
              >
                {{ item }}
              </li>
            </ul>
          </article>
        </div>
      </section>

      <!-- 各内容区使用一致的纵向留白，保持页面节奏 -->
      <ResumeHomeFaq :ref="registerRevealSection" class="resume-home__reveal" />

      <section
        :ref="registerRevealSection"
        class="resume-home__reveal relative mx-auto flex max-w-[1440px] items-center px-6 py-12 lg:px-12 lg:py-18"
      >
        <div class="relative w-full overflow-hidden rounded-[30px] px-6 text-center sm:px-12">
          <div class="relative mx-auto max-w-2xl">
            <h2 class="text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              {{ $t("resumeHomeClosingTitle") }}
            </h2>
            <p class="mt-3 leading-7 text-sf-text-2">
              {{ $t("resumeHomeClosingDescription") }}
            </p>
            <router-link
              to="/resume/template"
              class="mt-9 inline-flex cursor-pointer items-center gap-3 rounded-full bg-sf-theme px-6 py-3 font-semibold text-sf-theme-text transition-transform duration-300 hover:-translate-y-1"
            >
              {{ $t("resumeHomeStartFree") }}
              <SfIcon icon="mingcute:arrow-right-line" size="4" />
            </router-link>
          </div>
        </div>
      </section>
      <!-- 岗位范本目录与静态首屏共用内容，提供可直接抓取的详情链接。 -->
      <PublicContent />
    </main>
  </SfScrollbar>
</template>

<script setup>
import { TransitionPresets, useIntersectionObserver, useTransition } from "@vueuse/core";
import { useResumeStore } from "@/stores";
import { trackResumeAction } from "@/hooks";
import { resumeStyleTemplateList } from "@/views/resume/theme";
import { $t } from "@/locales";
// 真实访客与创建量暂不读取，恢复时启用统计接口。
// import { getStatsOverview } from "@/apis";
import { resumeTemplateList } from "../template/data/list";
import HeroSwitcher from "./heroSwitcher.vue";
import ResumeHomeFaq from "./faq.vue";
import PublicContent from "../seo/publicContent.vue";
import OnlineWriters from "../components/onlineWriters.vue";
// 首页展示区共用真实截图，切换入口后展示对应功能页面。
import editorShot from "@/assets/images/resume/editor.webp";
import createShot from "@/assets/images/resume/new.webp";
import aiShot from "@/assets/images/resume/ai.webp";
import { computed, onMounted, ref } from "vue";

// 展示项与功能截图一一对应，标题和替代文字随当前选项同步切换。
const editorShowcaseItems = computed(() => [
  { label: $t("resumeHomeEditorEyebrow"), image: editorShot }, // 标签为展示名称，图片为对应页面截图
  { label: $t("resumeHomeCreateEyebrow"), image: createShot }, // 标签为展示名称，图片为新建简历页面截图
  { label: $t("resumeHomeAiEyebrow"), image: aiShot }, // 标签为展示名称，图片为智能助手页面截图
]);
// 当前选中的展示项。
const activeEditorShowcaseIndex = ref(0);
const activeEditorShowcase = computed(() => editorShowcaseItems.value[activeEditorShowcaseIndex.value]);

const resumeStore = useResumeStore();
// 深拷贝：套用范本时隔离示例数据，避免与预览共享引用导致互相串改
const deepClone = (value) => JSON.parse(JSON.stringify(value));

// 首屏简历切换列表：预设角色，供首屏预览循环切换
const HERO_PREVIEW_FILES = [
  "xiaoZhou.ts",
  "xiaoYang.ts",
  "allFields.ts",
  "yangTeacher.ts",
  "futureYang.ts",
];
// 首屏切换条目：fileName 为预设角色标识，name 为预设角色名称，用作圆点的悬停提示与无障碍标签
const heroSwitcherItems = HERO_PREVIEW_FILES.map((fileName) => ({
  fileName,
  name: resumeTemplateList.find((template) => template.fileName === fileName)?.name ?? fileName,
}));

const revealSections = ref([]);

// 站点统计概览：累计访客与简历生成量，加载失败保持为空
// const overview = ref(null);

// 首页分别呈现内容范本与排版样式，避免将两者相乘成不真实的模板数量。
const headlineStats = computed(() => {
  // 真实简历生成量计算暂时保留为注释，方便后续恢复。
  // const actions = overview.value?.actions;
  // const resumeActions = actions ? (actions.create ?? 0) + (actions.import ?? 0) : 0;
  return [
    {
      count: resumeTemplateList.length,
      label: $t("resumeHomeResumeCount"),
    },
    {
      count: resumeStyleTemplateList.length,
      label: $t("resumeHomeStyleCount"),
    },
    {
      count: 5,
      label: $t("resumeHomeExportCount"),
    },
    {
      // count: overview.value?.visitors?.totalUsers ?? 0,
      count: 100000, // 固定访客数量。
      display: "10W+", // 首页固定展示文案，不参与数字动画。
      label: $t("resumeSiteStatsTotalVisitors"),
    },
    {
      // count: resumeActions,
      count: 60000, // 固定简历数量。
      display: "6W+", // 首页固定展示文案，不参与数字动画。
      label: $t("resumeSiteStatsResumeActions"),
    },
  ];
});

// 首页统计数字从零开始平滑滚动。
const headlineStatCounts = ref([0, 0, 0, 0, 0]);
const animatedHeadlineStats = useTransition(headlineStatCounts, {
  duration: 1500,
  transition: TransitionPresets.easeOutCubic,
});

// 首屏当前简历数据：由切换组件通知，未加载时为空
const heroPreview = ref(null);

// 记录切换组件当前展示的简历范本数据
function handleHeroChange(payload) {
  heroPreview.value = payload.data;
}

// 用当前预览的简历范本直接创建简历并进入编辑器
function createFromHeroPreview() {
  const item = heroPreview.value;
  if (!item) return;
  // 新建成功后上报一次简历创建动作
  if (resumeStore.addResume(deepClone(item))) {
    trackResumeAction({ eventType: "create", fileType: "none" });
  }
}

onMounted(async () => {
  // 真实统计请求暂时屏蔽，保留原逻辑便于恢复。
  // try {
  //   overview.value = await getStatsOverview();
  // } catch {
  //   overview.value = null;
  // }
  headlineStatCounts.value = headlineStats.value.map((stat) => stat.count);
});

// 页面每次进出视口都切换入场状态，让长页面滚动保持节奏感。
function registerRevealSection(element) {
  if (element && !revealSections.value.includes(element)) {
    revealSections.value.push(element);
  }
}

useIntersectionObserver(
  revealSections,
  (entries) => {
    entries.forEach((entry) => {
      // 只做进入时的显示：高于视口的区块在滚动中交叉比例会回落，撤回类名会让内容提前整体隐藏
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  // 阈值取 0.1：区块高于视口时交叉比例达不到 0.3，会永远不显示
  { threshold: 0.1 },
);

// 页面滚动由内部滚动容器承载，原生 hash 定位不生效，改为按目标元素主动滚动
// 滚动到首屏下方的编辑器截图，留出固定页头的高度
function scrollToEditor() {
  const target = document.getElementById("editor-shot");
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

// 首屏关键点：对应产品真实能力，不写做不到的承诺
const keyPoints = computed(() => [
  $t("resumeHomeKeyPointGenerate"),
  $t("resumeHomeKeyPointEvaluate"),
  $t("resumeHomeKeyPointPolish"),
  $t("resumeHomeKeyPointInterview"),
  $t("resumeHomeKeyPointExport"),
]);

const featureGroups = computed(() => [
  {
    id: "create",
    eyebrow: $t("resumeHomeCreateEyebrow"),
    description: $t("resumeHomeCreateDescription"),
    items: [
      $t("resumeHomeCreateFeature1"),
      $t("resumeHomeCreateFeature2"),
      $t("resumeHomeCreateFeature3"),
    ],
  },
  {
    id: "editor",
    eyebrow: $t("resumeHomeEditorEyebrow"),
    description: $t("resumeHomeEditorDescription"),
    items: [
      $t("resumeHomeEditorFeature1"),
      $t("resumeHomeEditorFeature2"),
      $t("resumeHomeEditorFeature3"),
    ],
  },
  {
    id: "ai",
    eyebrow: $t("resumeHomeAiEyebrow"),
    description: $t("resumeHomeAiDescription"),
    items: [$t("resumeHomeAiFeature1"), $t("resumeHomeAiFeature2"), $t("resumeHomeAiFeature3")],
  },
  {
    id: "statistics",
    eyebrow: $t("resumeHomeStatisticsEyebrow"),
    description: $t("resumeHomeStatisticsDescription"),
    items: [
      $t("resumeHomeStatisticsFeature1"),
      $t("resumeHomeStatisticsFeature2"),
      $t("resumeHomeStatisticsFeature3"),
    ],
  },
]);
</script>

<style scoped>
/* 按截图原始比例限制宽度，短屏中也为页头与切换区保留展示空间。 */
.resume-home__editor-showcase {
  max-width: min(900px, calc((100svh - 180px) * 1650 / 1143));
}

.resume-home__closing {
  background-image: linear-gradient(135deg, var(--sf-primary), var(--sf-transparent));
}

.resume-home__closing-orbit {
  position: absolute;
  width: 16rem;
  height: 16rem;
  border: 1px solid var(--sf-theme-2);
  border-radius: 9999px;
  pointer-events: none;
}

.resume-home__closing-orbit--one {
  top: -9rem;
  left: -6rem;
}

.resume-home__closing-orbit--two {
  right: -6rem;
  bottom: -10rem;
  width: 20rem;
  height: 20rem;
}

.resume-home__reveal {
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.resume-home__reveal.is-visible {
  opacity: 1;
}

.resume-home__reveal > article,
.resume-home__reveal > div {
  opacity: 0;
  transform: translateY(1.5rem);
  transition:
    opacity 0.5s ease-out,
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.resume-home__reveal.is-visible > article,
.resume-home__reveal.is-visible > div {
  opacity: 1;
  transform: translateY(0);
}

.resume-home__reveal > div:nth-child(2) {
  transition-delay: 0.12s;
}

.resume-home__journey-card {
  opacity: 0;
  transform: translateY(1.5rem);
  transition:
    opacity 0.5s ease-out,
    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.resume-home__reveal.is-visible .resume-home__journey-card {
  opacity: 1;
  transform: translateY(0);
}

.resume-home__journey-card:nth-child(2) {
  transition-delay: 0.09s;
}

.resume-home__journey-card:nth-child(3) {
  transition-delay: 0.18s;
}

.resume-home__journey-card:nth-child(4) {
  transition-delay: 0.27s;
}

.animate-rise {
  animation: rise 0.7s ease-out both;
}

.animate-rise--delay-one {
  animation-delay: 0.08s;
}

.animate-rise--delay-two {
  animation-delay: 0.16s;
}

.animate-rise--delay-three {
  animation-delay: 0.24s;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(1.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
