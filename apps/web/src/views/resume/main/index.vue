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
          <p
            class="animate-rise mb-6 inline-flex items-center gap-3 rounded-full border border-sf-b bg-sf-primary px-3 py-3 text-sm text-sf-text-2 shadow-sm"
          >
            <SfIcon icon="lucide:sparkles" size="4" class="text-sf-theme" />
            轻舟简历 · 一叶轻舟，助你渡过万重山
          </p>
          <h1
            class="animate-rise animate-rise--delay-one text-5xl leading-[1.15] font-black tracking-[-0.06em] sm:text-6xl lg:text-7xl"
          >
            写好<span class="resume-home__highlight">轻舟简历</span>，<br />
            让经历抵达下一站
          </h1>
          <p
            class="animate-rise animate-rise--delay-two mx-auto mt-6 max-w-xl text-base leading-8 text-sf-text-2 sm:text-lg lg:mx-0"
          >
            轻舟简历把零散经历梳理成有说服力的职业故事。从 AI
            表达优化、实时编辑，到模板、投递统计与多格式导出，为求职准备一整套顺手的工具。
          </p>
          <div
            class="animate-rise animate-rise--delay-three mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <button
              class="group inline-flex cursor-pointer items-center justify-center gap-3 rounded-full bg-sf-theme px-6 py-3 font-semibold text-sf-theme-text transition-transform duration-300 hover:-translate-y-1"
              @click="go"
            >
              开始制作简历
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
              探索特色
              <SfIcon icon="mingcute:arrow-down-line" size="4" />
            </a>
          </div>
          <dl
            class="animate-rise animate-rise--delay-three mt-12 grid grid-cols-2 border-t border-sf-b pt-6 text-left sm:grid-cols-4"
          >
            <div class="border-r border-sf-b pr-3">
              <dt class="text-xl font-black sm:text-2xl">10 款</dt>
              <dd class="mt-3 text-xs text-sf-text-3 sm:text-sm">专业简历模板</dd>
            </div>
            <div class="border-r border-sf-b px-3">
              <dt class="text-xl font-black sm:text-2xl">5 类</dt>
              <dd class="mt-3 text-xs text-sf-text-3 sm:text-sm">投递与备份导出</dd>
            </div>
            <div class="border-r border-sf-b pt-6 pr-3 sm:border-r-0 sm:px-3 sm:pt-0">
              <dt class="text-xl font-black sm:text-2xl">AI 助手</dt>
              <dd class="mt-3 text-xs text-sf-text-3 sm:text-sm">让表达更精准</dd>
            </div>
            <div class="pt-6 pl-3 sm:pt-0">
              <dt class="text-xl font-black sm:text-2xl">实时编辑</dt>
              <dd class="mt-3 text-xs text-sf-text-3 sm:text-sm">细节随改随见</dd>
            </div>
          </dl>
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
              <strong class="block text-sm">AI 正在润色</strong>
              <small class="text-xs text-sf-text-3">表达更有说服力</small>
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
                  <strong class="block text-base">首页产品截图预留区</strong>
                  <small class="mt-3 block text-sm text-sf-text-3"
                    >替换为您的编辑器或简历展示截图</small
                  >
                </span>
              </div>
              <span class="resume-home__grid absolute inset-0"></span>
              <span
                class="absolute right-6 bottom-6 rounded-full bg-sf-primary px-3 py-3 text-xs font-medium shadow-sm"
                >实时预览</span
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
              <span class="text-sm font-medium">一键导出，排版如初</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="journey"
        :ref="registerRevealSection"
        class="resume-home__reveal relative mx-auto flex min-h-screen max-w-[1440px] flex-col justify-center px-6 py-18 lg:px-12"
      >
        <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div class="max-w-2xl">
            <p class="text-sm font-semibold tracking-[0.18em] text-sf-theme">一条清晰的求职路径</p>
            <h2 class="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              不只做一份简历，帮你走完整个求职过程。
            </h2>
          </div>
          <p class="max-w-md leading-7 text-sf-text-2">
            先用模板与编辑器完成表达，再借助 AI 对准岗位，最后完成投递、跟进与复盘。
          </p>
        </div>
        <div class="resume-home__journey-grid mt-12 grid gap-3 md:grid-cols-4">
          <article
            v-for="(step, index) in journeySteps"
            :key="step.title"
            class="resume-home__journey-card group relative rounded-[24px] border border-sf-b bg-sf-primary p-6 transition-transform duration-300 hover:-translate-y-2"
          >
            <span class="text-sm font-black text-sf-theme">0{{ index + 1 }}</span>
            <SfIcon :icon="step.icon" size="6" class="mt-9 text-sf-theme" />
            <h3 class="mt-6 text-xl font-bold">{{ step.title }}</h3>
            <p class="mt-3 leading-7 text-sf-text-2">{{ step.description }}</p>
          </article>
        </div>
      </section>

      <section
        v-for="(group, index) in featureGroups"
        :id="group.id"
        :key="group.title"
        :ref="registerRevealSection"
        class="resume-home__reveal relative mx-auto grid min-h-screen max-w-[1440px] items-center gap-12 px-6 py-18 lg:grid-cols-2 lg:px-12"
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
        class="resume-home__reveal relative mx-auto flex min-h-screen max-w-[1440px] items-center px-6 py-18 lg:px-12"
      >
        <div
          class="resume-home__closing relative overflow-hidden rounded-[30px] border border-sf-b bg-sf-primary px-6 py-12 text-center sm:px-12"
        >
          <span class="resume-home__closing-orbit resume-home__closing-orbit--one"></span>
          <span class="resume-home__closing-orbit resume-home__closing-orbit--two"></span>
          <div class="relative mx-auto max-w-2xl">
            <span
              class="mx-auto flex h-15 w-15 items-center justify-center rounded-2xl bg-sf-theme text-sf-theme-text shadow-lg"
              ><SfIcon icon="lucide:sparkles" size="8"
            /></span>
            <h2 class="mt-6 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              现在，写下那个更好的自己。
            </h2>
            <p class="mt-3 leading-7 text-sf-text-2">
              你的下一份简历，值得从一个干净而有力的开始。
            </p>
            <button
              class="mt-9 inline-flex cursor-pointer items-center gap-3 rounded-full bg-sf-theme px-6 py-3 font-semibold text-sf-theme-text transition-transform duration-300 hover:-translate-y-1"
              @click="go"
            >
              免费开始制作
              <SfIcon icon="mingcute:arrow-right-line" size="4" />
            </button>
          </div>
        </div>
      </section>
      <SfFooter />
    </main>
  </SfScrollbar>
</template>

<script setup>
import { useIntersectionObserver } from "@vueuse/core";
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const revealSections = ref([]);

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

const journeySteps = [
  {
    icon: "ph:file-md-duotone",
    title: "创建简历",
    description: "从空白、快速填写或模板开始，为不同岗位准备不同版本。",
  },
  {
    icon: "mdi:widgets",
    title: "云帆编辑器",
    description: "编辑模块、调整样式、实时预览，并完成导出、分享与备份。",
  },
  {
    icon: "ph:brain-duotone",
    title: "小舟 AI 助手",
    description: "生成、优化、翻译与 JD 对标，也为面试准备提供针对性练习。",
  },
  {
    icon: "mdi:chart-pie",
    title: "星轨求职统计",
    description: "记录投递、跟进与 offer，用趋势和数据看清下一步方向。",
  },
];

const featureGroups = [
  {
    icon: "ph:file-md-duotone",
    id: "create",
    eyebrow: "创建简历",
    title: "从任意起点开始",
    description: "不论资料是否齐全，都能找到适合自己的创建方式。",
    shotTitle: "创建方式与模板截图预留区",
    shotDescription: "展示新建简历、快速填写或模板选择界面",
    items: [
      "从空白、基础信息或模板开始创建",
      "复制已有简历，为不同岗位单独准备",
      "10 款模板支持全屏预览后再使用",
      "导入 JSON 完整备份，继续编辑旧简历",
    ],
  },
  {
    icon: "mdi:widgets",
    id: "editor",
    eyebrow: "云帆编辑器",
    title: "按你的方式排版",
    description: "内容和视觉都可以细调，让信息结构真正服务于阅读。",
    shotTitle: "编辑器截图预留区",
    shotDescription: "展示模块编辑与实时预览的协同体验",
    items: [
      "模块导航、隐藏归档与自定义模块管理",
      "调整主题色、字体、边距、行距与模块间距",
      "切换个人信息展示、布局和头像位置，支持撤销重做与智能一页纸",
      "支持 PDF、PNG、Markdown、HTML 与 JSON 导出",
      "生成分享链接与二维码，并支持本地自动备份",
    ],
  },
  {
    icon: "ph:brain-duotone",
    id: "ai",
    eyebrow: "小舟 AI 助手",
    title: "AI 陪你准备表达",
    description: "从内容起草到面试练习，让每次开口与落笔都有更清晰的方向。",
    shotTitle: "AI 助手截图预留区",
    shotDescription: "展示简历优化、JD 对标或模拟面试过程",
    items: [
      "生成经历、润色表达与一键优化报告",
      "结合目标岗位 JD 做匹配分析和优化",
      "支持中文、英语、日语等多语言翻译",
      "自我介绍、面试押题与逐轮模拟训练",
    ],
  },
  {
    icon: "mdi:chart-pie",
    id: "statistics",
    eyebrow: "星轨求职统计",
    title: "记录每一份机会",
    description: "简历完成不是终点，投递节奏、面试进展和成果都值得被看见。",
    shotTitle: "投递统计截图预留区",
    shotDescription: "展示投递记录、趋势图与 offer 进度",
    items: [
      "记录投递、跟进、面试与 offer 状态",
      "查看近七天或本月的投递趋势",
      "统计已投递天数、进行中机会与 offer 数量",
      "批量录入投递记录，安排后续跟进事项",
    ],
  },
];

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
  text-decoration: underline;
  text-decoration-color: var(--sf-theme-2);
  text-underline-offset: 0.16em;
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
