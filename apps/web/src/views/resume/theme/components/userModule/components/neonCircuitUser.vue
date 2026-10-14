<script setup>
import UserName from "./userName.vue";
import UserContact from "./userContact.vue";
import UserAvatar from "./userAvatar.vue";
</script>

<template>
  <!-- 大字姓名下接左侧身份信息，字段内容继续读取当前简历。 -->
  <div class="neon-user w-full min-w-0 pb-6">
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
  --resume-user-name-shadow: 2px 2px #e83ae0, -2px -1px #62f5f2; /* 姓名双色辉光 */
  --resume-user-subtitle-color: #70f7f4;
  --resume-user-subtitle-size: 16px;
  --resume-user-subtitle-spacing: 0.1em;
  --resume-user-subtitle-family:
    Consolas, "Courier New", monospace; /* 副标题原本随姓名取等宽字体 */
  --resume-user-subtitle-shadow: 0 0 8px rgba(94, 245, 242, 0.45); /* 副标题青色辉光 */
  --resume-user-contact-gap: 6px; /* 资料逐行排列的行距 */
  --resume-user-contact-label-color: #69f8f4; /* 标签用青色与数值区分 */
}
</style>
