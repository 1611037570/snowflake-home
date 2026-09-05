<script setup>
import dayjs from "dayjs";
import { computed, inject } from "vue";
import { workYears } from "../../../../resumeName";
import DiffField from "../../../components/diffField/index.vue";

// 元信息组件：求职岗位 / 求职状态 / 性别 / 年龄 / 工作年限等有值字段自动排列，宽度策略由使用方通过 class 控制
const previewData = inject("previewData");
const fontValue = inject("fontValue");
const user = computed(() => previewData.value?.user?.data || {});

// 计算年龄
const age = computed(() => {
  const birthday = user.value?.birthday?.value;
  if (!birthday || !dayjs(birthday).isValid()) return 0;
  const ageDiff = dayjs().diff(dayjs(birthday), "year");
  return Math.max(0, ageDiff);
});

// 有值字段列表：sex/position/status 为可编辑字段，年龄与工作年限为派生文本；空值字段不占位，项间分隔线随列表自动生成
const metaItems = computed(() => {
  const items = [];
  if (user.value?.sex?.value) items.push({ key: "sex" });
  if (age.value) items.push({ text: `${age.value}岁` });
  if (workYears.value) items.push({ text: workYears.value });
  if (user.value?.position?.value) items.push({ key: "position" });
  if (user.value?.status?.value) items.push({ key: "status" });
  return items;
});
</script>

<template>
  <div class="ml-3 flex max-w-full min-w-0 flex-wrap items-center gap-3" :style="[fontValue(2)]">
    <template v-for="(item, index) in metaItems" :key="item.key || item.text">
      <span v-if="index > 0" class="h-3 w-px bg-current opacity-50"></span>
      <DiffField v-if="item.key" v-model="user[item.key]" />
      <span v-else>{{ item.text }}</span>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
