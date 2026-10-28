<script setup lang="ts">
// 求职工具入口：三个决策工具各自独立成页，这里只做导航入口，不承载工具内容。
</script>

<template>
  <SfScrollbar class="h-full bg-sf-page" flush>
    <!-- 入口移除装饰图标，页面与卡片统一使用紧凑内边距。 -->
    <main class="mx-auto w-full max-w-7xl p-3 text-sf-text">
      <header>
        <div class="flex flex-wrap items-center gap-3">
          <h1 class="text-lg font-semibold">{{ $t("resumeGuideToolsTitle") }}</h1>
          <span class="text-xs text-sf-text-3">{{ $t("resumeToolsEyebrow") }}</span>
        </div>
        <p class="mt-[6px] max-w-3xl text-xs leading-6 text-sf-text-2">
          {{ $t("resumeGuideToolsDescription") }}
        </p>
      </header>

      <section class="mt-3 grid gap-3 lg:grid-cols-3" :aria-label="$t('resumeGuideToolsTitle')">
        <RouterLink
          to="/resume/tools/resignation-score"
          class="group flex flex-col gap-3 rounded-xl border border-sf-b bg-sf-primary p-3 transition-colors hover:border-sf-theme hover:bg-sf-bg"
        >
          <article>
            <p class="text-xs text-sf-text-3">离职决策工具</p>
            <h2 class="mt-[6px] text-base leading-6 font-semibold text-sf-text">离职决策 10 项快速评分表</h2>
            <p class="mt-3 text-sm leading-6 text-sf-text-2">
              从收入、福利、通勤、加班、发展与健康等方面各选一档，1 分钟算出当前工作的综合得分。
            </p>
          </article>
          <strong class="mt-auto flex items-center justify-between border-t border-sf-b pt-3 text-sm font-medium text-sf-theme"><span>开始评分</span><span aria-hidden="true">→</span></strong>
        </RouterLink>

        <RouterLink
          to="/resume/tools/offer-comparison"
          class="group flex flex-col gap-3 rounded-xl border border-sf-b bg-sf-primary p-3 transition-colors hover:border-sf-theme hover:bg-sf-bg"
        >
          <article>
            <p class="text-xs text-sf-text-3">选 Offer 工具</p>
            <h2 class="mt-[6px] text-base leading-6 font-semibold text-sf-text">Offer 对比决策器</h2>
            <p class="mt-3 text-sm leading-6 text-sf-text-2">
              对比多份工作的收入、福利、时间成本、稳定性和成长条件，看清各自的综合优势与短板。
            </p>
          </article>
          <strong class="mt-auto flex items-center justify-between border-t border-sf-b pt-3 text-sm font-medium text-sf-theme"><span>开始对比</span><span aria-hidden="true">→</span></strong>
        </RouterLink>

        <RouterLink
          to="/resume/tools/real-hourly-wage"
          class="group flex flex-col gap-3 rounded-xl border border-sf-b bg-sf-primary p-3 transition-colors hover:border-sf-theme hover:bg-sf-bg"
        >
          <article>
            <p class="text-xs text-sf-text-3">工作时间价值工具</p>
            <h2 class="mt-[6px] text-base leading-6 font-semibold text-sf-text">真实时薪计算器</h2>
            <p class="mt-3 text-sm leading-6 text-sf-text-2">
              把大小周、单休、加班和通勤计入时间成本，算出这份工作的每小时真实回报。
            </p>
          </article>
          <strong class="mt-auto flex items-center justify-between border-t border-sf-b pt-3 text-sm font-medium text-sf-theme"><span>开始计算</span><span aria-hidden="true">→</span></strong>
        </RouterLink>
      </section>

      <footer class="mt-3 rounded-xl border border-sf-b bg-sf-primary p-3 text-xs leading-6 text-sf-text-2">
        <p class="font-semibold text-sf-text">{{ $t("resumeToolsFooterTitle") }}</p>
        <p class="mt-3">
          {{ $t("resumeToolsFooterDescription") }}
          <RouterLink to="/resume/guide" class="text-sf-theme transition-colors hover:underline">
            {{ $t("resumeGuideTitle") }}
          </RouterLink>
        </p>
      </footer>
    </main>
  </SfScrollbar>
</template>
