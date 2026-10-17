<script setup>
import UserContact from "./userContact.vue";
import UserName from "./userName.vue";
import UserAvatar from "./userAvatar.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const { theme: { themeColor } } = useResumePreviewContext();
</script>

<template>
  <!-- 姓名与现有副标题在左，现有个人信息字段与头像在右，不写入示例文案。 -->
  <div
    class="forest-chalk-user flex w-full min-w-0 items-end justify-between gap-9"
    :style="{ '--forest-chalk-accent': themeColor }"
  >
    <div class="min-w-0 flex-1"><UserName /></div>
    <div class="flex w-[45%] min-w-0 shrink-0 items-end justify-end gap-6">
      <UserContact class="min-w-0 flex-1" align="right" single-column-grid />
      <UserAvatar class="forest-chalk-user__avatar shrink-0" />
    </div>
  </div>
</template>

<style scoped>
/* 头像描边与当前主题色保持一致。 */
.forest-chalk-user__avatar { --resume-user-avatar-shadow: 0 0 0 2px var(--forest-chalk-accent); }
</style>
