<script setup>
import dayjs from "dayjs";
import { computed, inject } from "vue";
import { workYears } from "../../utils";
import Text from "./text.vue";

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
const themeColor = inject("themeColor");
// 在 setup 中获取注入的引用（inject 不可在 computed getter 内调用），再取响应式值
const themeTemplateRef = inject("themeTemplate");
// 风格模板：未提供时按默认样式处理
const themeTemplate = computed(() => themeTemplateRef?.value || "default");

// 代理数据是 computed，解包 .value 后访问
const user = computed(() => previewData.value?.user || {});

// 计算年龄
const age = computed(() => {
  const birthday = user.value?.birthday?.value;
  if (!birthday || !dayjs(birthday).isValid()) return 0;
  const ageDiff = dayjs().diff(dayjs(birthday), "year");
  return Math.max(0, ageDiff);
});

// 是否有电话/邮箱（控制渲染）
const hasPhone = computed(() => !!user.value?.phone?.value);
const hasEmail = computed(() => !!user.value?.email?.value);
</script>

<template>
  <div :style="[lineHeightValue(), fontValue()]" class="resume-row" data-module="user">
    <!-- 头部基本信息：modern 风格改为居中布局 -->
    <div
      class="flex items-center"
      :class="{ 'flex-col items-center': themeTemplate === 'modern' }"
      :style="[lineHeightValue(22)]"
    >
      <h1 class="font-bold tracking-wide" :style="[fontValue(14)]">
        <Text v-model="user.name" />
      </h1>
      <!-- modern 风格：姓名下主题色短横线 -->
      <div
        v-if="themeTemplate === 'modern'"
        class="my-1 h-1 w-10 rounded-full"
        :style="{ background: themeColor }"
      ></div>
      <div
        class="flex items-center gap-3"
        :class="{ 'ml-0': themeTemplate === 'modern' }"
        :style="[fontValue(2)]"
      >
        <Text v-if="user.sex?.value" v-model="user.sex" />
        <span v-if="user.sex?.value && (age || workYears)" class="h-3 w-px bg-current opacity-50"></span>
        <Text v-if="age" v-model="user.newAge" :display-value="age + '岁'" />
        <span v-if="age && workYears" class="h-3 w-px bg-current opacity-50"></span>
        <Text v-if="workYears" v-model="user.newWorkYears" :display-value="workYears" />
      </div>
    </div>
    <!-- 联系方式（直接基于原字段渲染，不创建临时对象避免引用断开）；modern 风格居中 -->
    <div
      class="mt-1 flex flex-wrap gap-x-6"
      :class="{ 'justify-center': themeTemplate === 'modern' }"
      data-module="user"
      v-if="hasPhone || hasEmail"
    >
      <div v-if="hasPhone" class="flex items-center">
        <div class="pr-1">电话：</div>
        <div class="font-medium">
          <Text v-model="user.phone" />
        </div>
      </div>
      <div v-if="hasEmail" class="flex items-center">
        <div class="pr-1">邮箱：</div>
        <div class="font-medium">
          <Text v-model="user.email" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
