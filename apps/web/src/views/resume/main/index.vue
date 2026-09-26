<template>
  <SfScrollbar class="h-full bg-sf-page">
    <main class="resume-home relative w-full shrink-0 overflow-hidden bg-sf-page text-sf-text">
      <div class="resume-home__aurora resume-home__aurora--one"></div>
      <div class="resume-home__aurora resume-home__aurora--two"></div>

      <section
        :ref="registerRevealSection"
        class="resume-home__reveal resume-home__hero relative mx-auto grid min-h-screen max-w-[1440px] items-center gap-12 px-6 pt-24 pb-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-12"
      >
        <article class="relative z-10 mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <h1
            class="animate-rise animate-rise--delay-one text-5xl leading-[1.15] font-black tracking-[-0.06em] sm:text-6xl lg:text-7xl"
          >
            {{ $t("resumeHomeHeroStart") }}<span class="resume-home__highlight">{{ $t("resumeHomeHeroHighlight") }}</span>，<br />
            {{ $t("resumeHomeHeroEnd") }}
          </h1>
          <dl
            class="animate-rise animate-rise--delay-three grid max-w-md grid-cols-1 pt-8 text-left sm:grid-cols-2"
          >
            <div
              v-for="(stat, index) in headlineStats"
              :key="stat.label"
              :class="[
                index % 2 === 0 ? 'sm:border-r' : '',
                index < 2 ? 'border-b' : '',
              ]"
              class="flex flex-col items-center justify-center border-sf-b py-3 text-center sm:px-3 sm:first:pl-0"
            >
              <dt class="text-xl font-black sm:text-2xl">
                <span class="text-sf-theme">{{ Math.round(animatedHeadlineStats[index]) }}</span>
                {{ stat.label }}
              </dt>
              <dd class="mt-3 text-xs text-sf-text-3 sm:text-sm">{{ stat.description }}</dd>
            </div>
          </dl>
          <div
            class="animate-rise animate-rise--delay-three mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <button
              class="group inline-flex cursor-pointer items-center justify-center gap-3 rounded-full bg-sf-theme px-6 py-3 font-semibold text-sf-theme-text transition-transform duration-300 hover:-translate-y-1"
              @click="go"
            >
              {{ $t("resumeHomeCreateFree") }}
              <SfIcon
                icon="mingcute:arrow-right-line"
                size="4"
                class="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
            <a
              class="inline-flex items-center justify-center gap-3 rounded-full border border-sf-b bg-sf-primary px-6 py-3 font-semibold transition-colors duration-300 hover:bg-sf-bg"
              href="#journey"
            >
              {{ $t("resumeHomeExploreFeatures") }}
              <SfIcon icon="mingcute:arrow-down-line" size="4" />
            </a>
          </div>
        </article>

        <div class="animate-float relative mx-auto w-full max-w-2xl lg:mr-0">
          <div
            class="resume-home__status absolute top-9 -left-3 z-10 hidden items-center gap-3 rounded-2xl border border-sf-b bg-sf-primary p-3 shadow-lg sm:flex"
          >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-xl bg-sf-theme-3 text-sf-theme"
            >
              <SfIcon icon="lucide:sparkles" size="4" />
            </span>
            <span>
              <strong class="block text-sm">{{ $t("resumeHomeTemplatesFree") }}</strong>
            </span>
          </div>
          <div
            class="resume-home__preview relative overflow-hidden rounded-[30px] border border-sf-b bg-sf-primary p-3 shadow-2xl"
          >
            <div class="flex items-center gap-3 rounded-2xl bg-sf-bg px-3 py-3">
              <span class="h-3 w-3 rounded-full bg-sf-error"></span>
              <span class="h-3 w-3 rounded-full bg-sf-warning"></span>
              <span class="h-3 w-3 rounded-full bg-sf-success"></span>
              <span class="ml-3 h-3 w-24 rounded-full bg-sf-bg-3"></span>
            </div>
            <div
              class="resume-home__shot group relative mt-3 aspect-[16/10] overflow-hidden rounded-2xl border border-dashed border-sf-b bg-sf-bg"
            >
              <!-- 将此区域替换为首页产品截图即可 -->
              <div
                class="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
              >
                <span
                  class="flex h-15 w-15 items-center justify-center rounded-2xl bg-sf-primary text-sf-theme shadow-sm"
                >
                  <SfIcon icon="material-symbols:image-outline" size="8" />
                </span>
                <span>
                    <strong class="block text-base">{{ $t("resumeHomeScreenshotPlaceholder") }}</strong>
                    <small class="mt-3 block text-sm text-sf-text-3"
                    >{{ $t("resumeHomeScreenshotHint") }}</small
                  >
                </span>
              </div>
              <span class="resume-home__grid absolute inset-0"></span>
              <span
                class="absolute right-6 bottom-6 rounded-full bg-sf-primary px-3 py-3 text-xs font-medium shadow-sm"
                >{{ $t("resumeHomeLivePreview") }}</span
              >
            </div>
          </div>
          <div
            class="resume-home__note absolute -right-3 -bottom-6 hidden rounded-2xl border border-sf-b bg-sf-primary p-3 shadow-lg sm:block"
          >
            <div class="flex items-center gap-3">
              <span
                class="flex h-9 w-9 items-center justify-center rounded-xl bg-sf-success-2 text-sf-success"
              >
                <SfIcon icon="lucide:check" size="4" />
              </span>
              <span class="text-sm font-medium">{{ $t("resumeHomeExportFree") }}</span>
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
            <p class="text-sm font-semibold tracking-[0.18em] text-sf-theme">{{ $t("resumeHomeJourneyEyebrow") }}</p>
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
            <button
              class="mt-9 inline-flex cursor-pointer items-center gap-3 rounded-full bg-sf-theme px-6 py-3 font-semibold text-sf-theme-text transition-transform duration-300 hover:-translate-y-1"
              @click="go"
            >
              {{ $t("resumeHomeStartFree") }}
              <SfIcon icon="mingcute:arrow-right-line" size="4" />
            </button>
          </div>
        </div>
      </section>
      <SfFooter />
    </main>
  </SfScrollbar>
  <IssueFeedback />
  <Share />
</template>

<script setup>
import { TransitionPresets, useIntersectionObserver, useTransition } from "@vueuse/core";
import { themeTemplateList } from "@/stores/modules/resume/config/uiConfig";
import { $t } from "@/locales";
import { resumeTemplateList } from "../template/data/list";
import { useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import IssueFeedback from "../components/issueFeedback.vue";
import Share from "../components/share.vue";

const router = useRouter();
const revealSections = ref([]);

// 首页分别呈现内容范本与排版样式，避免将两者相乘成不真实的模板数量。
const headlineStats = computed(() => [
  {
    count: resumeTemplateList.length,
    label: $t("resumeHomeResumeCount"),
    description: $t("resumeHomeResumeCountDescription"),
  },
  {
    count: themeTemplateList.length,
    label: $t("resumeHomeStyleCount"),
    description: $t("resumeHomeStyleCountDescription"),
  },
  {
    count: 5,
    label: $t("resumeHomeExportCount"),
    description: $t("resumeHomeExportCountDescription"),
  },
  {
    count: 2,
    label: $t("resumeHomeEditingCount"),
    description: $t("resumeHomeEditingCountDescription"),
  },
]);

// 首页统计数字从零开始平滑滚动。
const headlineStatCounts = ref([0, 0, 0, 0]);
const animatedHeadlineStats = useTransition(headlineStatCounts, {
  duration: 1500,
  transition: TransitionPresets.easeOutCubic,
});

onMounted(() => {
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

// 跳转至模板选择页开始创建简历
function go() {
  router.push("/resume/template");
}
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

.resume-home__preview {
  transform: perspective(1200px) rotateY(-5deg) rotateX(2deg);
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

.resume-home__hero {
  transition-delay: 0.08s;
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

.animate-float {
  animation: float 5s ease-in-out infinite;
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

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-0.75rem);
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

@media (max-width: 639px) {
  .resume-home__preview {
    transform: none;
  }
}
</style>
