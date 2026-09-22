<script setup>
import { computed } from "vue";
import { getPreviewText } from "../../../i18n";
import { useUserFieldVisibility } from "../useUserFieldVisibility";
import { useResumePreviewContext } from "../../../previewContext";

// 头像组件：位置与间距由使用方通过 class 控制
const { data: previewData, lang: previewLang } = useResumePreviewContext();
const user = computed(() => previewData.value?.user?.data || {});
const avatarAlt = computed(() => getPreviewText("avatarAlt", previewLang.value));
const { isUserFieldHidden } = useUserFieldVisibility();
</script>

<template>
  <img
    v-if="!isUserFieldHidden('avatar') && user.avatar"
    :src="user.avatar"
    :alt="avatarAlt"
    class="h-[132px] w-[94px] shrink-0 rounded object-cover"
  />
</template>

<style lang="scss" scoped></style>
