<template>
  <SfScrollbar class="h-full bg-sf-page">
    <main class="resume-home relative w-full shrink-0 overflow-hidden bg-sf-page text-sf-text">
      <div class="resume-home__aurora resume-home__aurora--one"></div>
      <div class="resume-home__aurora resume-home__aurora--two"></div>

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
          <span class="resume-home__glow pointer-events-none absolute -inset-6"></span>
          <!-- 卡片叠放层：让背景卡 inset-0 以主卡为基准，不含下方徽章 -->
          <div class="relative">
            <!-- 背后倾斜叠放的第二份简历（小羊），默认水平，首屏加载后过渡到倾斜角度 -->
            <div
              :class="{ 'is-tilted': heroTilted }"
              class="resume-home__stack-card absolute inset-0 -translate-x-22 -translate-y-6 scale-85 overflow-hidden border border-sf-b bg-sf-bg"
              aria-hidden="true"
            >
              <ThumbPreview v-if="heroBackPreview" :item="heroBackPreview" />
            </div>
            <div class="relative overflow-hidden rounded-none border border-sf-b bg-sf-primary">
              <!-- A4 竖版简历预览：按容器宽度整体缩放，只渲染首页 -->
              <div class="relative aspect-[794/1123] overflow-hidden bg-sf-bg">
                <ThumbPreview v-if="heroPreview" :item="heroPreview" />
                <div v-else class="flex-c absolute inset-0">
                  <SfIcon
                    icon="line-md:loading-twotone-loop"
                    size="6"
                    class="animate-spin text-sf-theme"
                  />
                </div>
              </div>
            </div>
          </div>
          <!-- 卖点标签统一置于简历下方 -->
          <div class="relative mt-6 flex flex-wrap justify-center gap-3">
            <div class="flex items-center gap-3 rounded-xl border border-sf-b bg-sf-primary p-3">
              <span
                class="flex h-6 w-6 items-center justify-center rounded-lg bg-sf-theme-2 text-sf-theme"
              >
                <SfIcon icon="lucide:sparkles" size="3" />
              </span>
              <span class="text-xs font-medium">{{ $t("resumeHomeTemplatesFree") }}</span>
            </div>
            <div class="flex items-center gap-3 rounded-xl border border-sf-b bg-sf-primary p-3">
              <span
                class="flex h-6 w-6 items-center justify-center rounded-lg bg-sf-info-2 text-sf-info"
              >
                <SfIcon icon="lucide:user-round-check" size="3" />
              </span>
              <span class="text-xs font-medium">{{ $t("resumeHomeNoSignup") }}</span>
            </div>
            <div class="flex items-center gap-3 rounded-xl border border-sf-b bg-sf-primary p-3">
              <span
                class="flex h-6 w-6 items-center justify-center rounded-lg bg-sf-success-2 text-sf-success"
              >
                <SfIcon icon="lucide:check" size="3" />
              </span>
              <span class="text-xs font-medium">{{ $t("resumeHomeExportFree") }}</span>
            </div>
          </div>
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
        <div class="resume-home__journey-grid mt-12 grid gap-3 md:grid-cols-4">
          <article
            v-for="(step, index) in journeySteps"
            :key="step.title"
            class="resume-home__journey-card group relative rounded-[24px] border border-sf-b bg-sf-primary p-6 transition-transform duration-300 hover:-translate-y-2"
          >
            <div class="flex items-center gap-3">
              <span class="text-sm font-black text-sf-theme">0{{ index + 1 }}</span>
              <div class="text-xl font-bold">{{ step.title }}</div>
            </div>
            <p class="mt-3 leading-7 text-sf-text-2">{{ step.description }}</p>
          </article>
        </div>
      </section>

      <section
        v-for="(group, index) in featureGroups"
        :id="group.id"
        :key="group.title"
        :ref="registerRevealSection"
        class="resume-home__reveal relative mx-auto grid max-w-[1440px] items-center gap-12 px-6 py-18 lg:grid-cols-2 lg:px-12"
      >
        <article :class="index % 2 ? 'lg:order-2' : ''" class="max-w-xl">
          <p class="text-sm font-semibold tracking-[0.18em] text-sf-theme">{{ group.eyebrow }}</p>
          <h2 class="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">{{ group.title }}</h2>
          <p class="mt-6 leading-8 text-sf-text-2">{{ group.description }}</p>
          <ul class="mt-9 grid gap-3 sm:grid-cols-2">
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
        </article>
        <div :class="index % 2 ? 'lg:order-1' : ''" class="relative">
          <div
            class="resume-home__feature-shot resume-home__shot relative aspect-[16/10] overflow-hidden rounded-[30px] border border-dashed border-sf-b bg-sf-bg"
          >
            <!-- 将此区域替换为对应模块的产品截图即可 -->
            <div
              class="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
            >
              <span
                class="flex h-15 w-15 items-center justify-center rounded-2xl bg-sf-primary text-sf-theme shadow-sm"
              >
                <SfIcon :icon="group.icon" size="8" />
              </span>
              <span>
                <strong class="block text-base">{{ group.shotTitle }}</strong>
                <small class="mt-3 block text-sm text-sf-text-3">{{ group.shotDescription }}</small>
              </span>
            </div>
            <span class="resume-home__grid absolute inset-0"></span>
          </div>
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
import { themeTemplateList } from "@/views/resume/theme";
import { $t } from "@/locales";
import { getStatsOverview } from "@/apis";
import { resumeTemplateList } from "../template/data/list";
import { loadResumeTemplateData } from "../template/data/resumeData";
import { computed, defineAsyncComponent, markRaw, onMounted, ref } from "vue";

// 首屏简历预览异步加载，避免把简历渲染引擎并入首页入口包
const ThumbPreview = defineAsyncComponent(
  () => import("@/views/resume/editor/preview/modes/thumb.vue"),
);
// 首屏预览使用的范本文件：通用简历范本
const HERO_PREVIEW_FILE = "xiaoZhou.ts";
// 首屏背后叠放的第二份简历范本：小羊
const HERO_BACK_PREVIEW_FILE = "xiaoYang.ts";

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
      count: themeTemplateList.length,
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

// 首屏真实简历预览数据：加载失败保持为空，预览区显示加载态
const heroPreview = ref(null);

// 背后叠放的第二份简历数据：小羊
const heroBackPreview = ref(null);

// 背景简历入场倾斜：挂载后下一帧再启用，保证从 0° 过渡到倾斜角度
const heroTilted = ref(false);

onMounted(async () => {
  // 双 rAF 确保首帧先按 0° 渲染，再触发倾斜过渡
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroTilted.value = true;
    });
  });
  try {
    overview.value = await getStatsOverview();
  } catch {
    overview.value = null;
  }
  try {
    heroPreview.value = markRaw(await loadResumeTemplateData(HERO_PREVIEW_FILE));
  } catch {
    heroPreview.value = null;
  }
  try {
    heroBackPreview.value = markRaw(await loadResumeTemplateData(HERO_BACK_PREVIEW_FILE));
  } catch {
    heroBackPreview.value = null;
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
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  },
  { threshold: 0.3 },
);

const journeySteps = computed(() => [
  {
    title: $t("resumeHomeStepCreateTitle"),
    description: $t("resumeHomeStepCreateDescription"),
  },
  {
    title: $t("resumeHomeStepEditorTitle"),
    description: $t("resumeHomeStepEditorDescription"),
  },
  {
    title: $t("resumeHomeStepAiTitle"),
    description: $t("resumeHomeStepAiDescription"),
  },
  {
    title: $t("resumeHomeStepStatisticsTitle"),
    description: $t("resumeHomeStepStatisticsDescription"),
  },
]);

const featureGroups = computed(() => [
  {
    icon: "ph:file-md-duotone",
    id: "create",
    eyebrow: $t("resumeHomeCreateEyebrow"),
    title: $t("resumeHomeCreateTitle"),
    description: $t("resumeHomeCreateDescription"),
    shotTitle: $t("resumeHomeCreateShotTitle"),
    shotDescription: $t("resumeHomeCreateShotDescription"),
    items: [
      $t("resumeHomeCreateFeature1"),
      $t("resumeHomeCreateFeature2"),
      $t("resumeHomeCreateFeature3"),
      $t("resumeHomeCreateFeature4"),
    ],
  },
  {
    icon: "mdi:widgets",
    id: "editor",
    eyebrow: $t("resumeHomeEditorEyebrow"),
    title: $t("resumeHomeEditorTitle"),
    description: $t("resumeHomeEditorDescription"),
    shotTitle: $t("resumeHomeEditorShotTitle"),
    shotDescription: $t("resumeHomeEditorShotDescription"),
    items: [
      $t("resumeHomeEditorFeature1"),
      $t("resumeHomeEditorFeature2"),
      $t("resumeHomeEditorFeature3"),
      $t("resumeHomeEditorFeature4"),
      $t("resumeHomeEditorFeature5"),
    ],
  },
  {
    icon: "ph:brain-duotone",
    id: "ai",
    eyebrow: $t("resumeHomeAiEyebrow"),
    title: $t("resumeHomeAiTitle"),
    description: $t("resumeHomeAiDescription"),
    shotTitle: $t("resumeHomeAiShotTitle"),
    shotDescription: $t("resumeHomeAiShotDescription"),
    items: [
      $t("resumeHomeAiFeature1"),
      $t("resumeHomeAiFeature2"),
      $t("resumeHomeAiFeature3"),
      $t("resumeHomeAiFeature4"),
    ],
  },
  {
    icon: "mdi:chart-pie",
    id: "statistics",
    eyebrow: $t("resumeHomeStatisticsEyebrow"),
    title: $t("resumeHomeStatisticsTitle"),
    description: $t("resumeHomeStatisticsDescription"),
    shotTitle: $t("resumeHomeStatisticsShotTitle"),
    shotDescription: $t("resumeHomeStatisticsShotDescription"),
    items: [
      $t("resumeHomeStatisticsFeature1"),
      $t("resumeHomeStatisticsFeature2"),
      $t("resumeHomeStatisticsFeature3"),
      $t("resumeHomeStatisticsFeature4"),
    ],
  },
]);
</script>

<style scoped>
.resume-home__aurora {
  position: absolute;
  width: 30rem;
  height: 30rem;
  border-radius: 9999px;
  background: var(--sf-theme-3);
  filter: blur(90px);
  opacity: 0.72;
  pointer-events: none;
  animation: aurora-drift 12s ease-in-out infinite alternate;
}

.resume-home__aurora--one {
  top: 3rem;
  right: -12rem;
}

.resume-home__aurora--two {
  top: 42rem;
  left: -15rem;
  opacity: 0.42;
  animation-delay: -6s;
}

.resume-home__highlight {
  color: var(--sf-theme);
}

/* 预览框背后的主题色柔光，让简历卡片从页面中浮起 */
.resume-home__glow {
  background: radial-gradient(closest-side, var(--sf-theme-3), transparent);
  filter: blur(24px);
}

/* 背景简历：默认水平，首屏加载后过渡到倾斜角度 */
.resume-home__stack-card {
  rotate: 0deg;
  transition: rotate 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

.resume-home__stack-card.is-tilted {
  rotate: -10deg;
}

.resume-home__grid {
  background-image:
    linear-gradient(var(--sf-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--sf-border) 1px, transparent 1px);
  background-size: 2rem 2rem;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    var(--sf-base) 35%,
    var(--sf-base) 70%,
    transparent
  );
  pointer-events: none;
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

@keyframes aurora-drift {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  100% {
    transform: translate3d(3rem, 2.25rem, 0) scale(1.12);
  }
}
</style>
