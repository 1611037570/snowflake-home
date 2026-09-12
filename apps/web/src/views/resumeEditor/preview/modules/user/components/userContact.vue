<script setup>
import { computed, inject } from "vue";
import { getPreviewText } from "../../../i18n";
import UserContactItem from "./userContactItem.vue";
import { useUserFieldVisibility } from "../useUserFieldVisibility";

// 联系方式组件：标签支持图标 / 文字两种模式，对齐方式由使用方通过 class 控制
const previewData = inject("previewData");
const userInfoMode = inject("userInfoMode");
const userInfoLayout = inject("userInfoLayout");
const props = defineProps({
  centered: {
    type: Boolean,
    default: false,
  },
});
const previewLang = inject(
  "previewLang",
  computed(() => "zh"),
);
const user = computed(() => previewData.value?.user?.data || {});
const { isUserFieldHidden } = useUserFieldVisibility();
const userFieldOrder = inject("userFieldOrder", computed(() => []));
const isIconMode = computed(() => userInfoMode?.value === "icon");
// 根据用户选择切换布局，并保持居中模式的对齐方式
const layoutClass = computed(() => {
  const isCentered = props.centered;
  if (userInfoLayout?.value === "flex") {
    return isCentered ? "flex flex-wrap justify-center gap-3" : "flex flex-wrap gap-3";
  }
  return isCentered
    ? "grid grid-cols-2 justify-items-center gap-3"
    : "grid grid-cols-2 gap-3";
});
const hasPhone = computed(() => !isUserFieldHidden("phone") && !!user.value?.phone?.value);
const hasEmail = computed(() => !isUserFieldHidden("email") && !!user.value?.email?.value);
const hasWechat = computed(() => !isUserFieldHidden("wechat") && !!user.value?.wechat?.value);
const phoneLabel = computed(() => getPreviewText("phoneLabel", previewLang.value));
const emailLabel = computed(() => getPreviewText("emailLabel", previewLang.value));
const wechatLabel = computed(() => getPreviewText("wechatLabel", previewLang.value));

// 第二行展示电话、邮箱及其他个人信息
const heightWeightText = computed(() => {
  if (isUserFieldHidden("heightWeight")) return "";
  const value = user.value?.heightWeight;
  const height = value?.height?.value;
  const weight = value?.weight?.value;
  const hasHeight = height != null && height !== "";
  const hasWeight = weight != null && weight !== "";
  if (!hasHeight && !hasWeight) return "";
  return [hasHeight ? `${height}cm` : "", hasWeight ? `${weight}kg` : ""].filter(Boolean).join("/");
});
const secondaryItems = computed(() => {
  const items = [];
  if (!isUserFieldHidden("status") && user.value?.status?.value) {
    items.push({
      key: "status",
      icon: "mdi:briefcase-check-outline",
      label: getPreviewText("statusLabel", previewLang.value),
    });
  }
  if (!isUserFieldHidden("political") && user.value?.political?.value) {
    items.push({
      key: "political",
      icon: "mdi:flag-outline",
      label: getPreviewText("politicalLabel", previewLang.value),
    });
  }
  if (!isUserFieldHidden("city") && user.value?.city?.value) {
    items.push({
      key: "city",
      icon: "mdi:map-marker-outline",
      label: getPreviewText("cityLabel", previewLang.value),
    });
  }
  if (!isUserFieldHidden("nativePlace") && user.value?.nativePlace?.value) {
    items.push({
      key: "nativePlace",
      icon: "mdi:home-outline",
      label: getPreviewText("nativePlaceLabel", previewLang.value),
    });
  }
  if (heightWeightText.value) {
    items.push({
      sortKey: "heightWeight",
      text: heightWeightText.value,
      icon: "mdi:human-male-height",
      label: getPreviewText("heightWeightLabel", previewLang.value),
    });
  }
  return items;
});
// 统一整理联系方式和扩展信息，交由通用单项组件渲染
const contactItems = computed(() => {
  const items = [];
  if (hasPhone.value) {
    items.push({
      key: "phone",
      icon: "mdi:phone",
      label: phoneLabel.value,
    });
  }
  if (hasEmail.value) {
    items.push({
      key: "email",
      icon: "mdi:email-outline",
      label: emailLabel.value,
    });
  }
  if (hasWechat.value) {
    items.push({
      key: "wechat",
      icon: "mdi:wechat",
      label: wechatLabel.value,
    });
  }
  const order = new Map(userFieldOrder.value.map((key, index) => [key, index]));
  return [...items, ...secondaryItems.value].sort(
    (a, b) =>
      (order.get(a.sortKey || a.key) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(b.sortKey || b.key) ?? Number.MAX_SAFE_INTEGER),
  );
});
</script>

<template>
  <div
    v-if="contactItems.length"
    class="max-w-full min-w-0 items-center"
    :class="layoutClass"
  >
    <UserContactItem
      v-for="item in contactItems"
      :key="item.key || item.text"
      :icon="item.icon"
      :label="item.label"
      :model-value="item.key ? user[item.key] : null"
      :text="item.text"
      :icon-mode="isIconMode"
    />
  </div>
</template>

<style lang="scss" scoped></style>
