<script setup>
import { computed, inject } from "vue";
import ResumeField from "../../../components/resumeField/index.vue";
import { getPreviewText } from "../../../i18n";

// 联系方式组件：标签支持图标 / 文字两种模式，对齐方式由使用方通过 class 控制
const previewData = inject("previewData");
const userInfoMode = inject("userInfoMode");
const previewLang = inject(
  "previewLang",
  computed(() => "zh"),
);
const user = computed(() => previewData.value?.user?.data || {});
const isIconMode = computed(() => userInfoMode?.value === "icon");
const hasPhone = computed(() => !!user.value?.phone?.value);
const hasEmail = computed(() => !!user.value?.email?.value);
const phoneLabel = computed(() => getPreviewText("phoneLabel", previewLang.value));
const emailLabel = computed(() => getPreviewText("emailLabel", previewLang.value));
</script>

<template>
  <div v-if="hasPhone || hasEmail" class="flex max-w-full min-w-0 flex-wrap gap-x-3">
    <div v-if="hasPhone" class="flex max-w-full min-w-0 items-center">
      <SfIcon v-if="isIconMode" icon="mdi:phone" size="3.5" class="mr-1 shrink-0" />
      <div v-else class="pr-1">{{ phoneLabel }}</div>
      <div class="max-w-full min-w-0 font-medium">
        <ResumeField :model-value="user.phone" />
      </div>
    </div>
    <div v-if="hasEmail" class="flex max-w-full min-w-0 flex-wrap items-center">
      <SfIcon
        v-if="isIconMode"
        icon="mdi:email-outline"
        size="3.5"
        class="mr-1 shrink-0"
      />
      <div v-else class="pr-1">{{ emailLabel }}</div>
      <div class="max-w-full min-w-0 font-medium">
        <ResumeField :model-value="user.email" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
