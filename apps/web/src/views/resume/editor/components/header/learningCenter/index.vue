<script setup>
import { defineAsyncComponent, ref } from "vue";

// 学习内容按需挂载，浏览指引不修改简历或中断编辑。
const LearningCenterModal = defineAsyncComponent(() => import("./learningCenterModal.vue"));
const visible = ref(false);
</script>

<template>
  <SfTooltip :content="$t('learningCenterTitle')">
    <button
      type="button"
      class="flex h-9 shrink-0 cursor-pointer items-center gap-3 rounded-3xl border border-sf-b bg-sf-page px-3 text-sm text-sf-text transition-colors hover:border-sf-theme hover:bg-sf-bg"
      :aria-label="$t('learningCenterTitle')"
      :aria-expanded="visible"
      @click="visible = true"
    >
      <SfIcon icon="mdi:book-open-page-variant" size="4" />
      <span class="hidden lg:inline">{{ $t("learningCenterTitle") }}</span>
    </button>
  </SfTooltip>
  <LearningCenterModal v-if="visible" v-model="visible" />
</template>
