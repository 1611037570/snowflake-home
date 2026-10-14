<script setup>
import UserName from "./userName.vue";
import UserContact from "./userContact.vue";
import UserAvatar from "./userAvatar.vue";
</script>

<template>
  <!-- 左侧姓名与右侧资料的分界继承公共栏宽，避免独立比例导致错位。 -->
  <div class="red-black-profile grid w-full min-w-0 items-center">
    <div
      class="flex min-w-0 items-center gap-3 pr-3"
      :style="{ color: 'var(--red-black-contrast)' }"
    >
      <UserAvatar class="shrink-0" />
      <UserName class="min-w-0" />
    </div>
    <UserContact
      class="red-black-contact min-w-0 pl-3 text-white"
      align="left"
      single-column-grid
    />
  </div>
</template>

<style scoped>
.red-black-profile {
  grid-template-columns: calc(var(--red-black-split) - var(--resume-page-inset-horizontal)) minmax(
      0,
      1fr
    );
  --resume-user-name-size: 42px;
  --resume-user-name-line-height: 1.15;
  --resume-user-subtitle-spacing: 0.16em;
}
/* 单列资料标签使用主题色，数值保持白色以对应黑色背景。 */
.red-black-contact {
  --resume-user-contact-gap: 6px 12px; /* 窄栏资料的行距与列间距 */
  --resume-user-contact-item-column-gap: 12px; /* 标签与数值之间的间距 */
  --resume-user-contact-label-color: var(--red-black-accent); /* 标签配色 */
}
</style>
