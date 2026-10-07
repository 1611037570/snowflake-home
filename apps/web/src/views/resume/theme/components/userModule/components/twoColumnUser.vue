<script setup>
import { computed } from "vue";
import UserAvatar from "./userAvatar.vue";
import UserName from "./userName.vue";
import UserContact from "./userContact.vue";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  // 当前分页覆盖的个人信息块，头像与姓名分别占一个块。
  blockRange: {
    type: Object,
    default: () => ({ start: 0 /* 起始块序号 */, end: Number.MAX_SAFE_INTEGER /* 结束块序号 */ }),
  },
});
// 续页只展示未消费的资料，避免重复头像和姓名。
const isBlockVisible = (index) => index >= props.blockRange.start && index < props.blockRange.end;

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
    <UserAvatar v-if="isBlockVisible(0)" :class="avatarAlignClass" data-layout-block-index="0" />
    <UserName v-if="isBlockVisible(1)" data-layout-block-index="1" />
    <UserContact v-if="blockRange.end > 2" class="w-full" single-column-grid :block-range="blockRange" />
  </div>
</template>
