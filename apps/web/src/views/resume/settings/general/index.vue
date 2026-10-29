<script setup lang="ts">
import LocalBackupSettings from "../../components/localBackupSettings.vue";
</script>

<template>
  <SfScrollbar class="h-full bg-sf-page" flush>
    <main class="mx-auto w-full max-w-screen-xl px-3 pt-3 text-sf-text sm:px-3">
      <header>
        <h1 class="text-lg font-semibold text-sf-text">
          {{ $t("resumeSettingsTitle") }}
        </h1>
        <p class="mt-[6px] max-w-3xl text-xs leading-6 text-sf-text-2">
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
