<script setup>
import dayjs from "dayjs";
import { computed, inject } from "vue";
import { workYears } from "../../../../resumeName";
import DiffField from "../../../components/diffField/index.vue";

// 元信息组件：性别 / 年龄 / 工作年限，宽度策略由使用方通过 class 控制
const previewData = inject("previewData");
const fontValue = inject("fontValue");
const user = computed(() => previewData.value?.user || {});

// 计算年龄
const age = computed(() => {
  const birthday = user.value?.birthday?.value;
  if (!birthday || !dayjs(birthday).isValid()) return 0;
  const ageDiff = dayjs().diff(dayjs(birthday), "year");
  return Math.max(0, ageDiff);
});
</script>

<template>
  <div class="ml-3 flex max-w-full min-w-0 flex-wrap items-center gap-3" :style="[fontValue(2)]">
    <DiffField v-if="user.sex?.value" v-model="user.sex" />
    <span
      v-if="user.sex?.value && (age || workYears)"
      class="h-3 w-px bg-current opacity-50"
    ></span>
    <span v-if="age">{{ age }}岁</span>
    <span v-if="age && workYears" class="h-3 w-px bg-current opacity-50"></span>
    <span v-if="workYears">{{ workYears }}</span>
  </div>
</template>

<style lang="scss" scoped></style>
