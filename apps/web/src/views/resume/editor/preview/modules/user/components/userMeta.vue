<script setup>
import dayjs from "dayjs";
import { computed, inject } from "vue";
import ResumeField from "../../../components/resumeField/index.vue";
import { getPreviewText } from "../../../i18n";
import { useUserFieldVisibility } from "../useUserFieldVisibility";

// 元信息组件：展示姓名旁的基础信息，宽度策略由使用方通过 class 控制
const props = defineProps({
  // 信息内容水平对齐：左 / 居中 / 右
  align: {
    type: String,
    default: "left",
  },
});
const previewData = inject("previewData");
const fontValue = inject("fontValue");
const userInfoLayout = inject("userInfoLayout");
const user = computed(() => previewData.value?.user?.data || {});
const { isUserFieldHidden } = useUserFieldVisibility();
const previewLang = inject(
  "previewLang",
  computed(() => "zh"),
);
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

// 有值字段列表：第一行固定展示性别、年龄、工作年限和求职岗位
const metaItems = computed(() => {
  const items = [];
  if (!isUserFieldHidden("sex") && user.value?.sex) items.push({ key: "sex" });
  if (age.value) {
    items.push({
      text: getPreviewText("age", previewLang.value, { age: age.value }),
    });
  }
  if (workYearsNumber.value) {
    items.push({
      text: getPreviewText("expYears", previewLang.value, { years: workYearsNumber.value }),
    });
  }
  if (!isUserFieldHidden("position") && user.value?.position) {
    items.push({ key: "position" });
  }
  return items;
});

// 根据信息位置切换布局，并保持对应的水平对齐方式
const layoutClass = computed(() => {
  const align = props.align || "left";
  const centered = align === "center";
  const alignEnd = align === "right";
  if (userInfoLayout?.value === "flex") {
    return ["flex flex-wrap gap-3", centered && "justify-center", alignEnd && "justify-end"];
  }
  return [
    "grid grid-cols-2 gap-3",
    centered && "justify-items-center",
    alignEnd && "justify-items-end",
  ];
});
</script>

<template>
  <div
    v-if="metaItems.length"
    class="max-w-full min-w-0 items-center"
    :class="layoutClass"
    :style="[fontValue()]"
  >
    <div v-for="item in metaItems" :key="item.key || item.text" class="min-w-0">
      <ResumeField v-if="item.key" :model-value="user[item.key]" />
      <span v-else>{{ item.text }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
