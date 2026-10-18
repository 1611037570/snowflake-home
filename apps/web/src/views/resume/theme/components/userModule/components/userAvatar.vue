<script setup>
import { computed } from "vue";
import { getPreviewText } from "@/views/resume/editor/preview/shared/i18n";
import { useUserFieldVisibility } from "../useUserFieldVisibility";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { AVATAR_RADIUS_LIMITS, resolveAvatarAspectRatio } from "@/domain/resume/theme/avatar";

// 头像组件：位置与间距由使用方通过 class 控制
const { data: previewData, lang: previewLang, ui: previewUi, themeDecisions } = useResumePreviewContext();
const user = computed(() => previewData.value?.user?.data || {});
const avatarAlt = computed(() => getPreviewText("avatarAlt", previewLang.value));
const { isUserFieldHidden } = useUserFieldVisibility();
// 用户头像设置只覆盖明确调整的项目，theme 保留当前主题声明的几何样式
const avatarStyle = computed(() => {
  const avatar = previewUi.value?.user?.avatar;
  if (!avatar) return {};
  const themeSize = themeDecisions.value.avatarSize;
  const configuredWidth = Number(avatar.width);
  const width = avatar.width !== null && Number.isFinite(configuredWidth) && configuredWidth > 0
    ? configuredWidth
    : themeSize.width;
  const ratio = avatar.ratio === "theme" && avatar.shape !== "circle"
    ? themeSize.width / themeSize.height
    : resolveAvatarAspectRatio(avatar);
  // 头像宽度读取用户覆盖或主题声明，高度始终按当前有效比例同步计算
  const style = {
    width: `${width}px`,
    height: `${Math.round(width / ratio)}px`,
  };
  const configuredRadius = Number(avatar.borderRadius);
  if (avatar.borderRadius !== null && Number.isFinite(configuredRadius)) {
    const radius = Math.min(AVATAR_RADIUS_LIMITS.max, Math.max(AVATAR_RADIUS_LIMITS.min, configuredRadius));
    style.borderRadius = `${radius}%`;
  } else {
    if (avatar.shape === "square") style.borderRadius = "0";
    if (avatar.shape === "rounded") style.borderRadius = "0.75rem";
    if (avatar.shape === "circle") style.borderRadius = "50%";
  }
  return style;
});
</script>

<template>
  <img
    v-if="!isUserFieldHidden('avatar') && user.avatar"
    :src="user.avatar"
    :alt="avatarAlt"
    :style="avatarStyle"
    class="resume-user-avatar shrink-0"
  />
</template>

<style lang="scss" scoped>
/* 头像宽高由主题声明与用户覆盖共同决定，其余外观继续读取主题变量。 */
.resume-user-avatar {
  max-width: var(--resume-user-avatar-max-width, none);
  border-radius: var(--resume-user-avatar-radius, 0.25rem);
  object-fit: var(--resume-user-avatar-fit, cover);
  object-position: var(--resume-user-avatar-position, center);
  border: var(--resume-user-avatar-border, 0);
  box-shadow: var(--resume-user-avatar-shadow, none);
}
</style>
