<script setup lang="ts">
import LocalBackupSettings from "../../components/localBackupSettings.vue";
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
    </main>
  </SfScrollbar>
</template>
