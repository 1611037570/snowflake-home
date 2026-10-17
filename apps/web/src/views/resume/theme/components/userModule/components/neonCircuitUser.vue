<script setup>
import UserName from "./userName.vue";
import UserContact from "./userContact.vue";
import UserAvatar from "./userAvatar.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 大字姓名下接左侧身份信息，字段内容继续读取当前简历。 -->
  <div class="neon-user w-full min-w-0 pb-6" :style="{ '--neon-user-accent': themeColor }">
    <!-- 头像复用公共字段显示规则，不因主题布局丢失。 -->
    <div class="flex min-w-0 items-center justify-between gap-3">
      <UserName class="min-w-0" />
      <UserAvatar class="shrink-0" />
    </div>
    <div class="mt-9 w-[46%] min-w-0">
      <UserContact class="w-full text-[12px]" single-column-grid />
    </div>
  </div>
</template>

<style scoped>
/* 姓名和副标题使用青紫双色辉光，字体、行距与标签配色一律走主题变量。 */
.neon-user {
  --resume-user-name-size: 48px;
  --resume-user-name-line-height: 1.1;
  --resume-user-name-spacing: 0.07em;
  --resume-user-name-color: #f4fffe;
  --resume-user-name-family: Consolas, "Courier New", monospace; /* 姓名等宽字体 */
  --resume-user-name-shadow: 0 0 8px var(--neon-user-accent); /* 姓名辉光跟随主题色 */
  --resume-user-subtitle-color: var(--neon-user-accent);
  --resume-user-subtitle-size: 16px;
  --resume-user-subtitle-spacing: 0.1em;
  --resume-user-subtitle-family:
    Consolas, "Courier New", monospace; /* 副标题原本随姓名取等宽字体 */
  --resume-user-subtitle-shadow: 0 0 8px var(--neon-user-accent); /* 副标题辉光跟随主题色 */
  --resume-user-contact-gap: 6px; /* 资料逐行排列的行距 */
  --resume-user-contact-label-color: var(--neon-user-accent); /* 标签跟随主题色 */
}
</style>
