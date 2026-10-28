<script setup lang="ts">
import PublicContent from "../seo/publicContent.vue";
// 求职工具入口：三个决策工具各自独立成页，这里只做导航入口，不承载工具内容。
</script>

<template>
  <SfScrollbar class="h-full bg-sf-page" flush>
    <main class="mx-auto w-full max-w-screen-xl px-3 pt-3 pb-3 text-sf-text sm:px-3">
      <header>
        <p class="text-sm font-semibold text-sf-theme">
          {{ $t("resumeToolsEyebrow") }}
        </p>
        <h1 class="mt-3 text-2xl font-black">
          {{ $t("resumeGuideToolsTitle") }}
        </h1>
        <p class="mt-3 max-w-3xl text-sm leading-normal text-sf-text-2">
          {{ $t("resumeGuideToolsDescription") }}
        </p>
      </header>

      <section class="mt-3 grid gap-3 xl:grid-cols-3" :aria-label="$t('resumeGuideToolsTitle')">
        <RouterLink
          to="/resume/tools/resignation-score"
          class="group grid gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3 transition-colors hover:border-sf-theme hover:bg-sf-bg md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
        >
          <article>
            <p class="text-sm font-semibold text-sf-text-2">离职决策工具</p>
            <h2 class="mt-3 text-2xl font-black text-sf-text">离职决策 10 项快速评分表</h2>
            <p class="mt-3 leading-normal text-sf-text-2">
              从收入、福利、通勤、加班、发展与健康等方面各选一档，1 分钟算出当前工作的综合得分。
            </p>
          </article>
          <strong class="text-sf-text transition-colors group-hover:text-sf-theme">开始评分 →</strong>
        </RouterLink>

        <RouterLink
          to="/resume/tools/offer-comparison"
          class="group grid gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3 transition-colors hover:border-sf-theme hover:bg-sf-bg md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
        >
          <article>
            <p class="text-sm font-semibold text-sf-text-2">选 Offer 工具</p>
            <h2 class="mt-3 text-2xl font-black text-sf-text">Offer 对比决策器</h2>
            <p class="mt-3 leading-normal text-sf-text-2">
              对比多份工作的收入、福利、时间成本、稳定性和成长条件，看清各自的综合优势与短板。
            </p>
          </article>
          <strong class="text-sf-text transition-colors group-hover:text-sf-theme">开始对比 →</strong>
        </RouterLink>

        <RouterLink
          to="/resume/tools/real-hourly-wage"
          class="group grid gap-3 rounded-3xl border border-sf-b bg-sf-primary p-3 transition-colors hover:border-sf-theme hover:bg-sf-bg md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
        >
          <article>
            <p class="text-sm font-semibold text-sf-text-2">工作时间价值工具</p>
            <h2 class="mt-3 text-2xl font-black text-sf-text">真实时薪计算器</h2>
            <p class="mt-3 leading-normal text-sf-text-2">
              把大小周、单休、加班和通勤计入时间成本，算出这份工作的每小时真实回报。
            </p>
          </article>
          <strong class="text-sf-text transition-colors group-hover:text-sf-theme">开始计算 →</strong>
        </RouterLink>
      </section>

      <footer class="mt-3 rounded-3xl border border-sf-b bg-sf-primary p-3 text-xs leading-normal text-sf-text-2">
        <p class="font-semibold text-sf-text">{{ $t("resumeToolsFooterTitle") }}</p>
        <p class="mt-3">
          {{ $t("resumeToolsFooterDescription") }}
          <RouterLink to="/resume/guide" class="text-sf-theme transition-colors hover:underline">
            {{ $t("resumeGuideTitle") }}
          </RouterLink>
        </p>
      </footer>
      <!-- 工具使用说明同时用于构建静态正文。 -->
      <PublicContent />
    </main>
  </SfScrollbar>
</template>
