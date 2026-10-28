<script setup>
// 小舟 AI 与编辑器弹窗复用同一份模型设置，绑定和添加状态保持一致。
import AiProviderSettingsContent from "../../editor/toolbar/modules/ai/content.vue";
import PublicContent from "../../seo/publicContent.vue";
</script>

<template>
  <SfScrollbar class="h-full bg-sf-page" flush>
    <main class="mx-auto flex h-full min-h-0 w-full max-w-[1080px] flex-col gap-6 px-3 py-6 text-sf-text">
      <header class="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold text-sf-theme">{{ $t("resumeSettingsModelTitle") }}</p>
          <h1 class="mt-3 text-2xl font-bold">{{ $t("resumeNavAi") }}</h1>
          <p class="mt-3 max-w-3xl text-sm leading-6 text-sf-text-2">
            {{ $t("resumeSettingsModelDescription") }}
          </p>
        </div>
        <RouterLink
          to="/resume/mine"
          class="inline-flex shrink-0 items-center gap-3 rounded-xl border border-sf-b bg-sf-primary px-3 py-3 text-sm font-medium transition-colors hover:border-sf-theme hover:bg-sf-bg"
        >
          {{ $t("resumeNavMyResumes") }}
          <SfIcon icon="mingcute:right-line" size="4" />
        </RouterLink>
      </header>
      <AiProviderSettingsContent class="min-h-[540px] flex-1" />
      <!-- 功能说明与静态网页共用正文，不包含模型密钥与配置值。 -->
      <PublicContent class="shrink-0" />
    </main>
  </SfScrollbar>
</template>
