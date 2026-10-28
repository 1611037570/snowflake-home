<script setup lang="ts">
import LocalBackupSettings from "../../components/localBackupSettings.vue";
import PublicContent from "../../seo/publicContent.vue";
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
        <h2 class="text-lg font-bold">{{ $t("resumeSettingsBackupTitle") }}</h2>
        <!-- 与编辑器头部的备份设置共用同一份内容组件 -->
        <LocalBackupSettings class="mt-3" />
      </section>
      <!-- 公开说明与构建正文共用内容，不包含目录授权信息。 -->
      <PublicContent />
    </main>
  </SfScrollbar>
</template>
