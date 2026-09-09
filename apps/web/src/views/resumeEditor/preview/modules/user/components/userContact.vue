<script setup>
import { computed, inject } from "vue";
import ResumeField from "../../../components/resumeField/index.vue";
import { getPreviewText } from "../../../i18n";

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
const isIconMode = computed(() => userInfoMode?.value === "icon");
// 根据用户选择切换布局，并保持居中模式的对齐方式
const layoutClass = computed(() => {
  const isCentered = props.centered;
  if (userInfoLayout?.value === "flex") {
    return isCentered ? "flex flex-wrap justify-center gap-3" : "flex flex-wrap gap-3";
  }
  return isCentered
    ? "grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] justify-items-center gap-3"
    : "grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-3";
});
const hasPhone = computed(() => !!user.value?.phone?.value);
const hasEmail = computed(() => !!user.value?.email?.value);
const phoneLabel = computed(() => getPreviewText("phoneLabel", previewLang.value));
const emailLabel = computed(() => getPreviewText("emailLabel", previewLang.value));

// 第二行展示电话、邮箱及其他个人信息
const heightWeightText = computed(() => {
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
  if (user.value?.status?.value) {
    items.push({
      key: "status",
      icon: "mdi:briefcase-check-outline",
      label: getPreviewText("statusLabel", previewLang.value),
    });
  }
  if (user.value?.political?.value) {
    items.push({
      key: "political",
      icon: "mdi:flag-outline",
      label: getPreviewText("politicalLabel", previewLang.value),
    });
  }
  if (user.value?.city?.value) {
    items.push({
      key: "city",
      icon: "mdi:map-marker-outline",
      label: getPreviewText("cityLabel", previewLang.value),
    });
  }
  if (user.value?.nativePlace?.value) {
    items.push({
      key: "nativePlace",
      icon: "mdi:home-outline",
      label: getPreviewText("nativePlaceLabel", previewLang.value),
    });
  }
  if (heightWeightText.value) {
    items.push({
      text: heightWeightText.value,
      icon: "mdi:human-male-height",
      label: getPreviewText("heightWeightLabel", previewLang.value),
    });
  }
  return items;
});
</script>

<template>
  <div
    v-if="hasPhone || hasEmail || secondaryItems.length"
    class="max-w-full min-w-0 items-center"
    :class="layoutClass"
  >
    <div v-if="hasPhone" class="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1">
      <SfIcon v-if="isIconMode" icon="mdi:phone" size="3.5" class="mr-1 shrink-0" />
      <div v-else class="pr-1">{{ phoneLabel }}</div>
      <div class="max-w-full min-w-0 font-medium">
        <ResumeField :model-value="user.phone" />
      </div>
    </div>
    <div v-if="hasEmail" class="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1">
      <SfIcon v-if="isIconMode" icon="mdi:email-outline" size="3.5" class="mr-1 shrink-0" />
      <div v-else class="pr-1">{{ emailLabel }}</div>
      <div class="max-w-full min-w-0 font-medium">
        <ResumeField :model-value="user.email" />
      </div>
    </div>
    <div
      v-for="item in secondaryItems"
      :key="item.key || item.text"
      class="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1"
    >
      <SfIcon v-if="isIconMode" :icon="item.icon" size="3.5" class="mr-1 shrink-0" />
      <div v-else class="pr-1">{{ item.label }}</div>
      <div v-if="item.key" class="max-w-full min-w-0 font-medium">
        <ResumeField :model-value="user[item.key]" />
      </div>
      <span v-else>{{ item.text }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
