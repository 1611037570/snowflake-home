<script setup>
import { defineAsyncComponent, ref } from "vue";

// 学习内容按需挂载，浏览指引不修改简历或中断编辑。
const LearningCenterModal = defineAsyncComponent(() => import("./learningCenterModal.vue"));
const visible = ref(false);
</script>

<template>
  <SfTooltip :content="$t('learningCenterTitle')">
    <!-- 完整沿用相邻入口的尺寸、图文间距、内边距与悬停样式。 -->
    <button
      type="button"
      class="flex h-9 cursor-pointer items-center gap-1 rounded-3xl border border-sf-b bg-sf-page p-1 px-2 text-sm transition-colors hover:bg-sf-theme hover:text-white"
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
