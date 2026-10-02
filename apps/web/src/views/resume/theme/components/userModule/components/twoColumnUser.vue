<script setup>
import { computed } from "vue";
import UserAvatar from "./userAvatar.vue";
import UserName from "./userName.vue";
import UserContact from "./userContact.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { avatarPosition },
} = useResumePreviewContext();
// 双栏头像始终置顶，水平位置跟随现有头像位置设置。
const avatarAlignClass = computed(() => {
  if (avatarPosition.value === "center") return "justify-self-center";
  if (avatarPosition.value === "right") return "justify-self-end";
  return "justify-self-start";
});
</script>

<template>
  <!-- 双栏个人信息独立排布：头像置顶且默认居左，其余内容按单列网格展示。 -->
  <div class="grid w-full min-w-0 grid-cols-1 gap-3">
    <UserAvatar :class="avatarAlignClass" />
    <UserName />
    <UserContact class="w-full" single-column-grid />
  </div>
</template>
