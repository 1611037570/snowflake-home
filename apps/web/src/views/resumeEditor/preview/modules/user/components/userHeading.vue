<script setup>
import { computed, inject } from "vue";
import UserAvatar from "./userAvatar.vue";
import UserMeta from "./userMeta.vue";
import UserName from "./userName.vue";

defineProps({
  // 是否显示姓名下主题色短横线（仅居中布局展示）
  showDivider: {
    type: Boolean,
    default: false,
  },
});

// 头像位置：由全局 avatarPosition 配置控制，左 / 居中 / 右
const avatarPositionRef = inject("avatarPosition");
const position = computed(() => avatarPositionRef?.value || "left");
const themeColor = inject("themeColor");
</script>

<template>
  <!-- 左：头像在姓名左侧，元信息撑满剩余宽度避免导出换行错位 -->
  <div v-if="position === 'left'" class="flex flex-wrap items-center">
    <UserAvatar class="mr-3" />
    <UserName />
    <UserMeta class="flex-1" />
  </div>
  <!-- 居中：头像在姓名上方居中，元信息占满整行并居中 -->
  <div v-else-if="position === 'center'" class="flex flex-col items-center">
    <UserAvatar class="mb-2" />
    <UserName />
    <div
      v-if="showDivider"
      class="my-1 h-1 w-10 rounded-full"
      :style="{ background: themeColor }"
    ></div>
    <UserMeta class="ml-0 w-full justify-center" />
  </div>
  <!-- 右：头像在姓名右侧，元信息撑满剩余宽度 -->
  <div v-else class="flex flex-wrap items-center">
    <UserName />
    <UserMeta class="flex-1" />
    <UserAvatar class="ml-3" />
  </div>
</template>

<style lang="scss" scoped></style>
