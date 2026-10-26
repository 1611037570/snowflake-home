<script setup lang="ts">
import LocalBackupSettings from "../../components/localBackupSettings.vue";
// 模型设置内容与编辑器工具栏共用同一份组件，避免两处各写一套。
import AiProviderSettingsContent from "../../editor/toolbar/modules/ai/content.vue";
</script>

<template>
  <SfScrollbar class="h-full bg-sf-page" flush>
    <main class="mx-auto w-full max-w-screen-xl px-3 pt-3 text-sf-text sm:px-3">
      <header>
        <p class="text-sm font-semibold text-sf-theme">
          {{ $t("resumeSettingsEyebrow") }}
        </p>
        <h1 class="mt-3 text-3xl font-black">
          {{ $t("resumeSettingsTitle") }}
        </h1>
        <p class="mt-3 max-w-3xl leading-normal text-sf-text-2">
          {{ $t("resumeSettingsDescription") }}
        </p>
      </header>

      <section class="mt-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <h2 class="text-lg font-bold">{{ $t("resumeSettingsModelTitle") }}</h2>
        <p class="mt-3 max-w-3xl text-sm leading-normal text-sf-text-2">
          {{ $t("resumeSettingsModelDescription") }}
        </p>
        <!-- 模型联动的列表与表单自带内部滚动，外层给定高度避免撑破页面。 -->
        <div class="mt-3 h-[36rem] min-h-0">
          <AiProviderSettingsContent class="h-full" />
        </div>
      </section>

      <section class="mt-3 rounded-3xl border border-sf-b bg-sf-primary p-3">
        <h2 class="text-lg font-bold">{{ $t("resumeSettingsBackupTitle") }}</h2>
        <!-- 与编辑器头部的备份设置共用同一份内容组件 -->
        <LocalBackupSettings class="mt-3" />
      </section>
    </main>
  </SfScrollbar>
</template>
