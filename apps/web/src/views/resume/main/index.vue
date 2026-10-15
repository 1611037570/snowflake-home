<template>
  <SfScrollbar class="h-full bg-sf-page" flush>
    <main class="resume-home relative w-full shrink-0 overflow-hidden bg-sf-page text-sf-text">
      <section
        class="resume-home__hero relative mx-auto grid min-h-screen max-w-[1440px] items-center gap-x-12 gap-y-9 px-6 pt-24 pb-9 lg:grid-cols-2 lg:px-12"
      >
        <article class="relative z-10 mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <h1
            class="animate-rise animate-rise--delay-one text-4xl leading-[1.15] font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl"
          >
            {{ $t("resumeHomeHeroStart")
            }}<span class="resume-home__highlight">{{ $t("resumeHomeHeroHighlight") }}</span
            >，<br />
            {{ $t("resumeHomeHeroEnd") }}
          </h1>
          <!-- 功能副标题：承载免费、免注册等功能检索词，紧邻标题提升抓取权重 -->
          <p class="animate-rise animate-rise--delay-two mt-6 text-base font-medium text-sf-text-2">
            {{ $t("resumeHomeHeroSubtitle") }}
          </p>
          <!-- 首屏指标：数字在上、标签在下，内容水平垂直居中 -->
          <dl
            class="animate-rise animate-rise--delay-three mt-9 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-5"
          >
            <div
              v-for="(stat, index) in headlineStats"
              :key="stat.label"
              class="flex flex-col items-center justify-center text-center"
            >
              <dt class="flex flex-col items-center gap-1">
                <span class="text-3xl font-black text-sf-theme">{{
                  Math.round(animatedHeadlineStats[index])
                }}</span>
                <span class="text-sm font-bold text-sf-text">{{ stat.label }}</span>
              </dt>
            </div>
          </dl>
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
            <a
              class="inline-flex items-center justify-center gap-3 rounded-full border border-sf-b bg-sf-primary px-6 py-3 font-semibold transition-colors duration-300 hover:bg-sf-bg"
              href="#journey"
            >
              {{ $t("resumeHomeExploreFeatures") }}
              <SfIcon icon="mingcute:arrow-down-line" size="4" />
            </a>
          </div>
        </article>

        <!-- 右侧：真实简历预览，替换原占位截图区 -->
        <div class="relative mx-auto w-full max-w-[380px]">
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

      <section
        id="journey"
        :ref="registerRevealSection"
        class="resume-home__reveal relative mx-auto flex max-w-[1440px] flex-col justify-center px-6 py-18 lg:px-12"
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
        <!-- 四个模块合并为左右交替的纵向时间轴：主线居中，卡片一左一右 -->
        <div class="resume-home__journey-grid mt-12 grid gap-6">
          <article
            v-for="(group, index) in featureGroups"
            :id="group.id"
            :key="group.id"
            class="resume-home__journey-card relative flex gap-6 md:block"
          >
            <!-- 时间轴节点：移动端排在卡片左侧，桌面端压在居中主线上 -->
            <span
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-sf-b bg-sf-primary text-sm font-black text-sf-theme md:absolute md:top-0 md:left-1/2 md:-translate-x-1/2"
            >
              0{{ index + 1 }}
            </span>
            <!-- 卡片占半幅：靠轴一侧留出 3rem 给节点 -->
            <div class="flex-1 md:w-1/2" :class="index % 2 ? 'md:ml-auto md:pl-12' : 'md:pr-12'">
              <div
                class="rounded-[21px] border border-sf-b bg-sf-primary p-3 transition-transform duration-300 hover:-translate-y-1"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-9 w-9 items-center justify-center rounded-xl bg-sf-theme-2 text-sf-theme"
                  >
                    <SfIcon :icon="group.icon" size="5" />
                  </span>
                  <h3 class="text-xl font-black tracking-[-0.02em]">{{ group.eyebrow }}</h3>
                </div>
                <p class="mt-3 leading-7 text-sf-text-2">{{ group.description }}</p>
                <ul class="mt-3 grid gap-3">
                  <li
                    v-for="item in group.items"
                    :key="item"
                    class="flex items-start gap-3 text-sm leading-6 text-sf-text-2"
                  >
                    <span
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sf-success-2 text-sf-success"
                    >
                      <SfIcon icon="lucide:check" size="3" />
                    </span>
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section
        :ref="registerRevealSection"
        class="resume-home__reveal relative mx-auto flex max-w-[1440px] items-center px-6 py-18 lg:px-12"
      >
        <div class="relative w-full overflow-hidden rounded-[30px] px-6 py-12 text-center sm:px-12">
          <div class="relative mx-auto max-w-2xl">
            <h2 class="mt-6 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
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
      <SfFooter />
    </main>
  </SfScrollbar>
</template>

<script setup>
import { TransitionPresets, useIntersectionObserver, useTransition } from "@vueuse/core";
import { useResumeStore } from "@/stores";
import { trackResumeAction } from "@/hooks";
import { resumeStyleTemplateList } from "@/views/resume/theme";
import { $t } from "@/locales";
import { getStatsOverview } from "@/apis";
import { resumeTemplateList } from "../template/data/list";
import HeroSwitcher from "./heroSwitcher.vue";
import OnlineWriters from "../components/onlineWriters.vue";
import { computed, onMounted, ref } from "vue";

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
const overview = ref(null);

// 首页分别呈现内容范本与排版样式，避免将两者相乘成不真实的模板数量。
const headlineStats = computed(() => {
  // 简历生成量 = 新建与导入动作合计
  const actions = overview.value?.actions;
  const resumeActions = actions ? (actions.create ?? 0) + (actions.import ?? 0) : 0;
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
      count: overview.value?.visitors?.totalUsers ?? 0,
      label: $t("resumeSiteStatsTotalVisitors"),
    },
    {
      count: resumeActions,
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
  try {
    overview.value = await getStatsOverview();
  } catch {
    overview.value = null;
  }
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

const featureGroups = computed(() => [
  {
    icon: "ph:file-md-duotone",
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
    icon: "mdi:widgets",
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
    icon: "ph:brain-duotone",
    id: "ai",
    eyebrow: $t("resumeHomeAiEyebrow"),
    description: $t("resumeHomeAiDescription"),
    items: [$t("resumeHomeAiFeature1"), $t("resumeHomeAiFeature2"), $t("resumeHomeAiFeature3")],
  },
  {
    icon: "mdi:chart-pie",
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
.resume-home__highlight {
  color: var(--sf-theme);
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

/* 时间轴主线：每行自绘一段，从节点下沿连到下一行，最后一行不再延伸 */
.resume-home__journey-card::before {
  position: absolute;
  top: 3rem;
  bottom: -1.5rem;
  left: 1.5rem;
  width: 1px;
  transform: translateX(-50%);
  background: var(--sf-border);
  content: "";
}

/* 相邻两行的咬合距离：每行都上移同样的值，节点才会沿轴均匀推进。
   取值必须满足「咬合 ≤ 卡片高度 ÷ 2 + 行间距」，超出后同一侧的前后两张卡会叠在一起。 */
.resume-home__journey-grid {
  --journey-overlap: 6rem;
}

/* 桌面端主线移到整行的正中：卡片在哪一侧都不影响轴的位置 */
@media (min-width: 768px) {
  .resume-home__journey-card::before {
    left: 50%;
    /* 主线缩短咬合距离，正好收在下一行节点的上沿 */
    bottom: calc(var(--journey-overlap) - 1.5rem);
  }

  /* 首行之外的每一行都上移相同距离，行间距与节点间距保持一致 */
  .resume-home__journey-card:nth-child(n + 2) {
    margin-top: calc(-1 * var(--journey-overlap));
  }
}

.resume-home__journey-card:last-child::before {
  content: none;
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
