<script setup>
import { computed } from "vue";
import UserAvatar from "./userAvatar.vue";
import UserContact from "./userContact.vue";
// import UserLogo from "./userLogo.vue";
import UserName from "./userName.vue";
import { useResumePreviewContext } from "../../../previewContext";

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

// 头像与信息位置统一读取预览共享上下文。
const {
  theme: { avatarPosition: avatarPositionRef, infoPosition: infoPositionRef, themeColor },
} = useResumePreviewContext();
const position = computed(() => avatarPositionRef.value || "left");
const infoPosition = computed(() => infoPositionRef.value || "left");
const infoAlignClass = computed(() => INFO_ALIGN_CLASS[infoPosition.value] || "items-start");
</script>

<template>
  <!-- 左：头像在左，校徽固定在右侧，信息区撑满剩余宽度避免导出换行错位 -->
  <div v-if="position === 'left'" class="flex w-full flex-wrap items-center">
    <UserAvatar class="mr-3" />
    <div class="flex max-w-full min-w-0 flex-1 flex-col gap-3" :class="infoAlignClass">
      <UserName />
      <UserContact class="w-full" :align="infoPosition" />
    </div>
    <!-- <UserLogo class="ml-3" /> -->
  </div>
  <!-- 居中：校徽固定在左上角，头像保持居中，信息区对齐由信息位置独立控制 -->
  <div v-else-if="position === 'center'" class="relative flex w-full flex-col items-center gap-3">
    <!-- <UserLogo class="absolute left-0 top-0" /> -->
    <UserAvatar />
    <div class="flex w-full max-w-full min-w-0 flex-col gap-3" :class="infoAlignClass">
      <UserName />
      <div
        v-if="showDivider && infoPosition === 'center'"
        class="my-1 h-1 w-10 rounded-full"
        :style="{ background: themeColor }"
      ></div>
      <UserContact class="w-full" :align="infoPosition" />
    </div>
  </div>
  <!-- 右：校徽固定在左侧，信息区居中占据剩余空间，头像在右侧 -->
  <div v-else class="flex w-full flex-wrap items-center">
    <!-- <UserLogo class="mr-3" /> -->
    <div class="flex max-w-full min-w-0 flex-1 flex-col gap-3" :class="infoAlignClass">
      <UserName />
      <UserContact class="w-full" :align="infoPosition" />
    </div>
    <UserAvatar class="ml-3" />
  </div>
</template>

<style lang="scss" scoped></style>
