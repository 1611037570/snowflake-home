<script setup>
import { computed, inject } from "vue";
import { getPreviewText } from "../../../i18n";

// 头像组件：位置与间距由使用方通过 class 控制
const previewData = inject("previewData");
const previewLang = inject(
  "previewLang",
  computed(() => "zh"),
);
const user = computed(() => previewData.value?.user?.data || {});
const avatarAlt = computed(() => getPreviewText("avatarAlt", previewLang.value));
</script>

<template>
  <img
    v-if="user.avatar?.value"
    :src="user.avatar?.value"
    :alt="avatarAlt"
    class="h-[98px] w-[70px] shrink-0 rounded object-cover"
  />
</template>

<style lang="scss" scoped></style>
