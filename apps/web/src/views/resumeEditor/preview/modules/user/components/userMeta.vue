<script setup>
import dayjs from "dayjs";
import { computed, inject } from "vue";
import ResumeField from "../../../components/resumeField/index.vue";
import { getPreviewText } from "../../../i18n";

// 元信息组件：按调用方指定的行展示字段，宽度策略由使用方通过 class 控制
const props = defineProps({
  row: {
    type: String,
    default: "primary",
  },
  centered: {
    type: Boolean,
    default: false,
  },
});
const previewData = inject("previewData");
const fontValue = inject("fontValue");
const userInfoMode = inject("userInfoMode");
const user = computed(() => previewData.value?.user?.data || {});
const previewLang = inject(
  "previewLang",
  computed(() => "zh"),
);
const isIconMode = computed(() => userInfoMode?.value === "icon");

// 计算年龄
const age = computed(() => {
  const birthday = user.value?.birthday?.value;
  if (!birthday || !dayjs(birthday).isValid()) return 0;
  const ageDiff = dayjs().diff(dayjs(birthday), "year");
  return Math.max(0, ageDiff);
});

// 按个人资料中的参加工作时间计算工作经验，避免依赖全局当前简历状态
const workYearsNumber = computed(() => {
  const workTime = user.value?.workTime?.value;
  if (!workTime) return 0;
  const startDate = dayjs(workTime);
  if (!startDate.isValid()) return 0;
  const diffInMonths = dayjs().diff(startDate, "month");
  const years = Math.floor((diffInMonths + 7) / 12);
  return years > 0 ? years : 0;
});

// 身高体重：对象 { height, weight }，任一项有值时拼接为文本
const heightWeightText = computed(() => {
  const value = user.value?.heightWeight;
  const height = value?.height?.value;
  const weight = value?.weight?.value;
  const hasHeight = height != null && height !== "";
  const hasWeight = weight != null && weight !== "";
  if (!hasHeight && !hasWeight) return "";
  return [hasHeight ? `${height}cm` : "", hasWeight ? `${weight}kg` : ""]
    .filter(Boolean)
    .join("/");
});

// 有值字段列表：第一行固定展示性别、年龄、工作年限和求职岗位
const metaItems = computed(() => {
  const items = [];
  if (user.value?.sex?.value) items.push({ key: "sex", primary: true });
  if (age.value) {
    items.push({
      text: getPreviewText("age", previewLang.value, { age: age.value }),
      primary: true,
    });
  }
  if (workYearsNumber.value) {
    items.push({
      text: getPreviewText("expYears", previewLang.value, { years: workYearsNumber.value }),
      primary: true,
    });
  }
  if (user.value?.position?.value) items.push({ key: "position", primary: true });
  if (user.value?.status?.value) {
    items.push({
      key: "status",
      icon: "mdi:briefcase-check-outline",
      label: getPreviewText("statusLabel", previewLang.value),
    });
  }
  // 政治面貌
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
  // 籍贯
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
const primaryItems = computed(() => metaItems.value.filter((item) => item.primary));
const secondaryItems = computed(() => metaItems.value.filter((item) => !item.primary));
const rowItems = computed(() => (props.row === "secondary" ? secondaryItems.value : primaryItems.value));
</script>

<template>
  <div
    v-if="rowItems.length || $slots.default"
    class="ml-3 flex max-w-full min-w-0 flex-wrap items-center gap-3"
    :class="{ 'justify-center': props.centered }"
    :style="[fontValue(2)]"
  >
    <template v-for="(item, index) in rowItems" :key="item.key || item.text">
      <span v-if="index > 0" class="h-3 w-px bg-current opacity-50"></span>
      <template v-if="item.key">
        <SfIcon
          v-if="item.icon && isIconMode"
          :icon="item.icon"
          size="3.5"
          class="mr-1 shrink-0"
        />
        <span v-else-if="item.label">{{ item.label }}</span>
        <ResumeField :model-value="user[item.key]" />
      </template>
      <template v-else>
        <SfIcon
          v-if="item.icon && isIconMode"
          :icon="item.icon"
          size="3.5"
          class="mr-1 shrink-0"
        />
        <span v-else-if="item.label">{{ item.label }}</span>
        <span>{{ item.text }}</span>
      </template>
    </template>
    <span v-if="rowItems.length && $slots.default" class="h-3 w-px bg-current opacity-50"></span>
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
