<script setup>
import { computed } from "vue";
import UserAvatar from "./userAvatar.vue";
import UserContact from "./userContact.vue";
// 校徽沿用个人信息区预留的位置。
import UserLogo from "./userLogo.vue";
import UserName from "./userName.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

// 信息位置对应的信息区水平对齐类名
const INFO_ALIGN_CLASS = {
  left: "items-start",
  center: "items-center",
  right: "items-end",
};

// 头像与信息位置统一读取预览共享上下文。
const {
  theme: { avatarPosition: avatarPositionRef, infoPosition: infoPositionRef },
} = useResumePreviewContext();
const position = computed(() => avatarPositionRef.value || "left");
const infoPosition = computed(() => infoPositionRef.value || "left");
const infoAlignClass = computed(() => INFO_ALIGN_CLASS[infoPosition.value] || "items-start");
</script>

<template>
  <!-- 左：头像在左，校徽贴右上角，信息区撑满剩余宽度避免导出换行错位 -->
  <div v-if="position === 'left'" class="flex w-full flex-wrap items-center">
    <UserAvatar class="mr-3" />
    <div class="flex max-w-full min-w-0 flex-1 flex-col gap-3" :class="infoAlignClass">
      <UserName />
      <UserContact class="w-full" :align="infoPosition" />
    </div>
    <UserLogo class="ml-3 self-start" />
  </div>
  <!-- 居中：校徽固定在左上角，头像保持居中，信息区对齐由信息位置独立控制 -->
  <div v-else-if="position === 'center'" class="relative flex w-full flex-col items-center gap-3">
    <UserLogo class="absolute left-0 top-0" />
    <UserAvatar />
    <div class="flex w-full max-w-full min-w-0 flex-col gap-3" :class="infoAlignClass">
      <UserName />
      <slot name="divider" />
      <UserContact class="w-full" :align="infoPosition" />
    </div>
  </div>
  <!-- 右：校徽贴左上角，信息区居中占据剩余空间，头像在右侧 -->
  <div v-else class="flex w-full flex-wrap items-center">
    <UserLogo class="mr-3 self-start" />
    <div class="flex max-w-full min-w-0 flex-1 flex-col gap-3" :class="infoAlignClass">
      <UserName />
      <UserContact class="w-full" :align="infoPosition" />
    </div>
    <UserAvatar class="ml-3" />
  </div>
</template>

<style lang="scss" scoped></style>
