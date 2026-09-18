<script setup>
import dayjs from "dayjs";
import { computed, inject } from "vue";
import { isUserCustomFieldKey } from "@/stores/modules/resume/hooks/useUserCustomField";
import { getUserSubtitleKeys } from "@/stores/modules/resume/hooks/useUserSubtitle";
import { getPreviewText } from "../../../i18n";
import UserContactItem from "./userContactItem.vue";
import { useUserFieldVisibility } from "../useUserFieldVisibility";

// 个人信息组件：基础信息与联系方式统一排序展示，标签支持图标、文字和隐藏模式，对齐方式由使用方通过 class 控制
const previewData = inject("previewData");
const userInfoMode = inject("userInfoMode");
const userInfoLayout = inject("userInfoLayout");
const props = defineProps({
  // 信息内容水平对齐：左 / 居中 / 右
  align: {
    type: String,
    default: "left",
  },
});
const previewLang = inject(
  "previewLang",
  computed(() => "zh"),
);
const user = computed(() => previewData.value?.user?.data || {});
// 字段级 UI 配置（图标等），与编辑器同读个人信息模块 ui 层级
const ui = computed(() => previewData.value?.user?.ui || {});
// 读取字段配置中的图标，未配置时为 undefined 由图标组件兜底处理
const fieldIcon = (key) => ui.value?.[key]?.icon;
// 副标题字段在姓名下方单独展示，不再出现在信息行
const subtitleKeys = computed(() => getUserSubtitleKeys(ui.value));
const { isUserFieldHidden } = useUserFieldVisibility();
const userFieldOrder = inject("userFieldOrder", computed(() => []));
const userFieldLabels = inject("userFieldLabels", computed(() => new Map()));
const isIconMode = computed(() => userInfoMode?.value === "icon");
// 隐藏模式仅保留个人信息字段值
const isLabelHidden = computed(() => userInfoMode?.value === "none");
// 计算年龄
const age = computed(() => {
  if (isUserFieldHidden("birthday")) return 0;
  const birthday = user.value?.birthday;
  if (!birthday || !dayjs(birthday).isValid()) return 0;
  const ageDiff = dayjs().diff(dayjs(birthday), "year");
  return Math.max(0, ageDiff);
});
// 按个人资料中的参加工作时间计算工作经验，避免依赖全局当前简历状态
const workYearsNumber = computed(() => {
  if (isUserFieldHidden("workTime")) return 0;
  const workTime = user.value?.workTime;
  if (!workTime) return 0;
  const startDate = dayjs(workTime);
  if (!startDate.isValid()) return 0;
  const diffInMonths = dayjs().diff(startDate, "month");
  const years = Math.floor((diffInMonths + 7) / 12);
  return years > 0 ? years : 0;
});
// 根据信息位置切换布局，并保持对应的水平对齐方式
const layoutClass = computed(() => {
  const align = props.align || "left";
  const centered = align === "center";
  const alignEnd = align === "right";
  if (userInfoLayout?.value === "flex") {
    // 弹性布局下非居中时按行内流式排布，靠对齐方式控制水平位置
    if (!centered) return alignEnd ? "block text-right" : "block";
    return ["flex flex-wrap gap-3", "justify-center"];
  }
  return [
    "grid grid-cols-2 gap-3",
    centered && "justify-items-center",
    alignEnd && "justify-items-end",
  ];
});
const hasPhone = computed(() => !isUserFieldHidden("phone") && !!user.value?.phone);
const hasEmail = computed(() => !isUserFieldHidden("email") && !!user.value?.email);
const hasWechat = computed(() => !isUserFieldHidden("wechat") && !!user.value?.wechat);
const hasGithub = computed(() => !isUserFieldHidden("github") && !!user.value?.github);
const phoneLabel = computed(() => getPreviewText("phoneLabel", previewLang.value));
const emailLabel = computed(() => getPreviewText("emailLabel", previewLang.value));
const wechatLabel = computed(() => getPreviewText("wechatLabel", previewLang.value));
const githubLabel = computed(() => getPreviewText("githubLabel", previewLang.value));

// 基础信息（性别、年龄、工作年限、求职岗位）与联系方式合并为同一列表
const metaItems = computed(() => {
  const items = [];
  if (!isUserFieldHidden("sex") && user.value?.sex) {
    items.push({
      key: "sex",
      icon: fieldIcon("sex"),
      label: getPreviewText("sexLabel", previewLang.value),
    });
  }
  if (age.value) {
    items.push({
      // 年龄跟随出生日期排序，图标与标签沿用出生日期字段配置
      sortKey: "birthday",
      icon: fieldIcon("birthday"),
      label: getPreviewText("ageLabel", previewLang.value),
      text: getPreviewText("age", previewLang.value, { age: age.value }),
    });
  }
  if (workYearsNumber.value) {
    items.push({
      // 工作年限跟随参加工作时间排序，图标与标签沿用参加工作时间字段配置
      sortKey: "workTime",
      icon: fieldIcon("workTime"),
      label: getPreviewText("expYearsLabel", previewLang.value),
      text: getPreviewText("expYears", previewLang.value, { years: workYearsNumber.value }),
    });
  }
  if (!isUserFieldHidden("position") && user.value?.position) {
    items.push({
      key: "position",
      icon: fieldIcon("position"),
      label: getPreviewText("positionLabel", previewLang.value),
    });
  }
  return items;
});

// 身高体重按身高与体重拼接展示
const heightWeightText = computed(() => {
  if (isUserFieldHidden("heightWeight")) return "";
  const value = user.value?.heightWeight;
  const height = value?.height;
  const weight = value?.weight;
  const hasHeight = height != null && height !== "";
  const hasWeight = weight != null && weight !== "";
  if (!hasHeight && !hasWeight) return "";
  return [hasHeight ? `${height}cm` : "", hasWeight ? `${weight}kg` : ""].filter(Boolean).join("/");
});
const secondaryItems = computed(() => {
  const items = [];
  if (!isUserFieldHidden("status") && user.value?.status) {
    items.push({
      key: "status",
      icon: fieldIcon("status"),
      label: getPreviewText("statusLabel", previewLang.value),
    });
  }
  if (!isUserFieldHidden("political") && user.value?.political) {
    items.push({
      key: "political",
      icon: fieldIcon("political"),
      label: getPreviewText("politicalLabel", previewLang.value),
    });
  }
  if (!isUserFieldHidden("marital") && user.value?.marital) {
    items.push({
      key: "marital",
      icon: fieldIcon("marital"),
      label: getPreviewText("maritalLabel", previewLang.value),
    });
  }
  if (!isUserFieldHidden("nation") && user.value?.nation) {
    items.push({
      key: "nation",
      icon: fieldIcon("nation"),
      label: getPreviewText("nationLabel", previewLang.value),
    });
  }
  if (!isUserFieldHidden("zodiac") && user.value?.zodiac) {
    items.push({
      key: "zodiac",
      icon: fieldIcon("zodiac"),
      label: getPreviewText("zodiacLabel", previewLang.value),
    });
  }
  if (!isUserFieldHidden("mbti") && user.value?.mbti) {
    items.push({
      key: "mbti",
      icon: fieldIcon("mbti"),
      label: getPreviewText("mbtiLabel", previewLang.value),
    });
  }
  if (!isUserFieldHidden("city") && user.value?.city) {
    items.push({
      key: "city",
      icon: fieldIcon("city"),
      label: getPreviewText("cityLabel", previewLang.value),
    });
  }
  if (!isUserFieldHidden("nativePlace") && user.value?.nativePlace) {
    items.push({
      key: "nativePlace",
      icon: fieldIcon("nativePlace"),
      label: getPreviewText("nativePlaceLabel", previewLang.value),
    });
  }
  if (!isUserFieldHidden("salary") && user.value?.salary) {
    items.push({
      key: "salary",
      icon: fieldIcon("salary"),
      label: getPreviewText("salaryLabel", previewLang.value),
    });
  }
  if (heightWeightText.value) {
    items.push({
      // 身高体重没有对应的原始字段项，去重时按字段标识匹配
      fieldKey: "heightWeight",
      sortKey: "heightWeight",
      text: heightWeightText.value,
      icon: fieldIcon("heightWeight"),
      label: getPreviewText("heightWeightLabel", previewLang.value),
    });
  }
  return items;
});
// 自定义字段与预设字段共用更多字段排序，标题由运行时配置提供
const customItems = computed(() =>
  userFieldOrder.value
    .filter((key) => isUserCustomFieldKey(key))
    .filter((key) => !isUserFieldHidden(key) && user.value?.[key])
    .map((key) => ({
      key,
      icon: fieldIcon(key),
      label: userFieldLabels.value.get(key) || "自定义字段",
    })),
);
// 统一整理基础信息、联系方式和扩展信息，交由通用单项组件渲染
const contactItems = computed(() => {
  const items = [];
  if (hasPhone.value) {
    items.push({
      key: "phone",
      icon: fieldIcon("phone"),
      label: phoneLabel.value,
    });
  }
  if (hasEmail.value) {
    items.push({
      key: "email",
      // 图标读取字段 UI 配置，由表单默认值兜底写入
      icon: fieldIcon("email"),
      label: emailLabel.value,
    });
  }
  if (hasWechat.value) {
    items.push({
      key: "wechat",
      icon: fieldIcon("wechat"),
      label: wechatLabel.value,
    });
  }
  if (hasGithub.value) {
    items.push({
      key: "github",
      icon: fieldIcon("github"),
      label: githubLabel.value,
    });
  }
  const order = new Map(userFieldOrder.value.map((key, index) => [key, index]));
  return [...metaItems.value, ...items, ...secondaryItems.value, ...customItems.value]
    // 副标题字段不再出现在信息行，年龄与工作年限等衍生项保留
    .filter((item) => !subtitleKeys.value.includes(item.key || item.fieldKey))
    .sort(
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
      :hide-label="isLabelHidden"
      :flow-mode="userInfoLayout === 'flex' && align !== 'center'"
    />
  </div>
</template>

<style lang="scss" scoped></style>
