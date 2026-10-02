<script setup>
import { computed } from "vue";
import UserAvatar from "./userAvatar.vue";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";
import { getPreviewText, getPreviewTitle } from "@/views/resume/editor/preview/shared/i18n";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";
import { useUserFieldVisibility } from "../useUserFieldVisibility";

const {
  data: previewData,
  lang: previewLang,
  theme: { avatarPosition, fontValue },
} = useResumePreviewContext();
const user = computed(() => previewData.value?.user?.data || {});
const { isUserFieldHidden } = useUserFieldVisibility();
// 头像位置继续响应预览区设置，主题只决定个人信息的分组方式。
const avatarAlignClass = computed(() => {
  if (avatarPosition.value === "center") return "justify-self-center";
  if (avatarPosition.value === "right") return "justify-self-end";
  return "justify-self-start";
});
const identity = computed(() => [
  !isUserFieldHidden("sex") && user.value.sex,
  !isUserFieldHidden("birthday") && user.value.birthday
    ? `${getPreviewText("birthdayLabel", previewLang.value)}${user.value.birthday}`
    : "",
  !isUserFieldHidden("city") && user.value.city,
].filter(Boolean).join(" | "));
const contacts = computed(() => [
  ["phone", "phoneLabel"],
  ["wechat", "wechatLabel"],
  ["email", "emailLabel"],
].filter(([key]) => !isUserFieldHidden(key) && user.value[key])
  .map(([key, label]) => ({
    key, // 联系字段编号
    text: `${getPreviewText(label, previewLang.value)}${user.value[key]}`, // 联系字段显示文案
  })));
</script>

<template>
  <!-- 左栏个人信息只展示身份和联系方式，求职信息由独立派生模块展示。 -->
  <div class="teal-rail-user grid w-full min-w-0 grid-cols-1 gap-3">
    <UserAvatar :class="avatarAlignClass" />
    <ResumeField v-if="!isUserFieldHidden('name')" :model-value="user.name" class="font-bold" :style="fontValue(10)" />
    <ResumeField v-if="identity" :model-value="identity" class="text-sm text-gray-600" />
    <section v-if="contacts.length" class="mt-6 flex min-w-0 flex-col gap-3">
      <h2 class="font-bold">{{ getPreviewTitle("contact", previewLang) }}</h2>
      <ResumeField v-for="contact in contacts" :key="contact.key" :model-value="contact.text" class="text-sm text-gray-600" />
    </section>
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
