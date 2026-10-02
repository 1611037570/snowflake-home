<script setup>
import { computed } from "vue";
import UserAvatar from "./userAvatar.vue";
import UserName from "./userName.vue";
import UserContact from "./userContact.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const {
  theme: { avatarPosition },
} = useResumePreviewContext();
// 头像位置继续响应预览区设置，主题只决定个人信息的分组方式。
const avatarAlignClass = computed(() => {
  if (avatarPosition.value === "center") return "justify-self-center";
  if (avatarPosition.value === "right") return "justify-self-end";
  return "justify-self-start";
});
</script>

<template>
  <!-- 左栏复用公共个人信息，求职字段与其它可见资料一同展示。 -->
  <div class="teal-rail-user grid w-full min-w-0 grid-cols-1 gap-3">
    <UserAvatar :class="avatarAlignClass" />
    <UserName />
    <UserContact class="w-full" single-column-grid />
  </div>
</template>

<style scoped>
/* 方形头像属于本主题的个人信息组件，不改变其它双栏主题尺寸。 */
.teal-rail-user :deep(img) {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 3px;
}
</style>
