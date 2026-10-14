<script setup>
import { computed } from "vue";
import { getPreviewText } from "@/views/resume/editor/preview/shared/i18n";
import { useUserFieldVisibility } from "../useUserFieldVisibility";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

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
    class="resume-user-avatar shrink-0"
  />
</template>

<style lang="scss" scoped>
/* 头像几何统一读取主题变量，未声明时保持原有尺寸。 */
.resume-user-avatar {
  width: var(--resume-user-avatar-width, 94px);
  height: var(--resume-user-avatar-height, 132px);
  max-width: var(--resume-user-avatar-max-width, none);
  border-radius: var(--resume-user-avatar-radius, 0.25rem);
  object-fit: var(--resume-user-avatar-fit, cover);
  object-position: var(--resume-user-avatar-position, center);
  border: var(--resume-user-avatar-border, 0);
  box-shadow: var(--resume-user-avatar-shadow, none);
}
</style>
