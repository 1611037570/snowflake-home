<script>
// 设置限制与当前外观一起声明，界面保留选项并说明无法调整的原因。
const unsupportedSettings = {
  "user.infoLayout": "themeFixedContactLayout", // 个人资料固定使用单列网格
};
export default { unsupportedSettings };
</script>

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
    <UserAvatar v-if="isBlockVisible(0)" :class="avatarAlignClass" data-layout-block-index="0" />
    <UserName v-if="isBlockVisible(1)" data-layout-block-index="1" />
    <UserContact v-if="blockRange.end > 2" class="w-full" single-column-grid :block-range="blockRange" />
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
