<script setup>
// 模型选择与添加已迁到通用设置，本页暂时只保留能力介绍与开发中提示。
const seoFeatureKeys = [
  "resumeAiSeoFeatureGenerate",
  "resumeAiSeoFeaturePolish",
  "resumeAiSeoFeatureMatch",
  "resumeAiSeoFeatureReview",
  "resumeAiSeoFeatureInterview",
];
</script>

<template>
  <SfScrollbar class="h-full bg-sf-page" flush>
    <main class="mx-auto w-full max-w-screen-xl px-3 pt-3 text-sf-text sm:px-3">
      <header>
        <p class="text-sm font-semibold text-sf-theme">{{ $t("resumeAiSeoEyebrow") }}</p>
        <h1 class="mt-3 text-3xl font-black tracking-[-0.03em] text-sf-text">
          {{ $t("resumeAiSeoTitle") }}
        </h1>
        <p class="mt-3 max-w-4xl text-sm leading-6 text-sf-text-2">
          {{ $t("resumeAiSeoDescription") }}
        </p>
        <ul class="mt-3 flex flex-wrap gap-3">
          <li
            v-for="featureKey in seoFeatureKeys"
            :key="featureKey"
            class="rounded-full bg-sf-bg px-3 py-1 text-xs font-medium text-sf-text-2"
          >
            {{ $t(featureKey) }}
          </li>
        </ul>
      </header>

      <section class="mt-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <div class="flex flex-col items-center gap-3 py-6 text-center">
          <SfIcon icon="lucide:construction" size="10" class="text-sf-text-3" />
          <h2 class="text-lg font-bold text-sf-text">{{ $t("resumeAiDevelopingTitle") }}</h2>
          <p class="max-w-3xl text-sm leading-normal text-sf-text-2">
            {{ $t("resumeAiDevelopingDescription") }}
          </p>
          <!-- 模型配置已迁走，这里给出直达入口，避免用户找不到设置。 -->
          <RouterLink
            to="/resume/settings"
            class="rounded-xl bg-sf-theme-3 px-3 py-3 text-sm font-bold text-sf-theme transition-colors hover:bg-sf-theme hover:text-sf-theme-text"
          >
            {{ $t("resumeAiDevelopingAction") }}
          </RouterLink>
        </div>
      </section>
    </main>
  </SfScrollbar>
</template>
