<script setup>
// 顶栏反馈入口：复用问题收集组件，通过插槽把触发元素换成与导出按钮同款的胶囊。
import IssueFeedback from "../../../components/issueFeedback.vue";
</script>

<template>
  <IssueFeedback>
    <template #trigger="{ open }">
      <button
        type="button"
        class="flex h-9 cursor-pointer items-center gap-1 rounded-3xl border border-sf-b bg-sf-page p-1 px-2 text-sm transition-colors hover:bg-sf-theme hover:text-white"
        :title="$t('feedbackShort')"
        @click="open"
      >
        <SfIcon icon="ph:chat-teardrop-dots-fill" size="4" />
        <span class="hidden lg:inline">{{ $t("feedbackShort") }}</span>
      </button>
    </template>
  </IssueFeedback>
</template>
