<script setup>
import { computed, inject } from "vue";
import UserAvatar from "./userAvatar.vue";
import UserContact from "./userContact.vue";
import UserMeta from "./userMeta.vue";
import UserName from "./userName.vue";

defineProps({
  // 是否显示姓名下主题色短横线（仅信息居中时展示）
  showDivider: {
    type: Boolean,
    default: false,
  },
});

// 信息位置对应的信息区水平对齐类名
const INFO_ALIGN_CLASS = {
  left: "items-start",
  center: "items-center",
  right: "items-end",
};

// 头像位置：由全局 avatarPosition 配置控制，左 / 居中 / 右
const avatarPositionRef = inject("avatarPosition");
const position = computed(() => avatarPositionRef?.value || "left");
// 信息位置：独立控制信息内容的水平对齐，与头像位置各管各的
const infoPositionRef = inject("infoPosition");
const infoPosition = computed(() => infoPositionRef?.value || "left");
const infoAlignClass = computed(() => INFO_ALIGN_CLASS[infoPosition.value] || "items-start");
const themeColor = inject("themeColor");
</script>

<template>
  <!-- 左：头像在左，信息区在右，元信息撑满剩余宽度避免导出换行错位 -->
  <div v-if="position === 'left'" class="flex w-full flex-wrap items-center">
    <UserAvatar class="mr-3" />
    <div class="flex max-w-full min-w-0 flex-1 flex-col gap-3" :class="infoAlignClass">
      <UserName />
      <UserMeta class="w-full" :align="infoPosition" />
      <UserContact class="w-full" :align="infoPosition" />
    </div>
  </div>
  <!-- 居中：头像在上，信息区对齐由信息位置独立控制 -->
  <div v-else-if="position === 'center'" class="flex w-full flex-col items-center">
    <UserAvatar />
    <div class="flex w-full max-w-full min-w-0 flex-col gap-3" :class="infoAlignClass">
      <UserName />
      <div
        v-if="showDivider && infoPosition === 'center'"
        class="my-1 h-1 w-10 rounded-full"
        :style="{ background: themeColor }"
      ></div>
      <UserMeta class="w-full" :align="infoPosition" />
      <UserContact class="w-full" :align="infoPosition" />
    </div>
  </div>
  <!-- 右：信息区在左，头像在右，元信息撑满剩余宽度 -->
  <div v-else class="flex w-full flex-wrap items-center">
    <div class="flex max-w-full min-w-0 flex-1 flex-col gap-3" :class="infoAlignClass">
      <UserName />
      <UserMeta class="w-full" :align="infoPosition" />
      <UserContact class="w-full" :align="infoPosition" />
    </div>
    <UserAvatar class="ml-3" />
  </div>
</template>

<style lang="scss" scoped></style>
