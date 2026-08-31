<script setup>
import { computed, inject } from "vue";
import UserAvatar from "./userAvatar.vue";
import UserContact from "./userContact.vue";
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
  <!-- 左：头像在左，信息区在右，元信息撑满剩余宽度避免导出换行错位 -->
  <div v-if="position === 'left'" class="flex flex-wrap items-center">
    <UserAvatar class="mr-3" />
    <div class="min-w-0 max-w-full flex-1">
      <div class="flex flex-wrap items-center">
        <UserName />
        <UserMeta class="flex-1" />
      </div>
      <UserContact />
    </div>
  </div>
  <!-- 居中：头像在上，信息区垂直居中 -->
  <div v-else-if="position === 'center'" class="flex flex-col items-center">
    <UserAvatar class="mb-2" />
    <div class="flex min-w-0 max-w-full flex-col items-center">
      <UserName />
      <div
        v-if="showDivider"
        class="my-1 h-1 w-10 rounded-full"
        :style="{ background: themeColor }"
      ></div>
      <UserMeta class="w-full justify-center" />
      <UserContact class="justify-center" />
    </div>
  </div>
  <!-- 右：信息区在左，头像在右，元信息撑满剩余宽度 -->
  <div v-else class="flex flex-wrap items-center">
    <div class="min-w-0 max-w-full flex-1">
      <div class="flex flex-wrap items-center">
        <UserName />
        <UserMeta class="flex-1" />
      </div>
      <UserContact />
    </div>
    <UserAvatar class="ml-3" />
  </div>
</template>

<style lang="scss" scoped></style>
