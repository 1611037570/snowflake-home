<script setup>
import dayjs from "dayjs";
import { computed, inject } from "vue";
import { workYears } from "../../resumeName";
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
// 用户信息展示模式（图标/文字）
const userInfoMode = inject("userInfoMode");

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
    <div class="flex flex-wrap items-center" :class="{ 'flex-col items-center': themeTemplate === 'modern' }">
      <!-- 头像：default 风格在姓名左侧，modern 风格在姓名上方居中 -->
      <img
        v-if="user.avatar?.value"
        :src="user.avatar?.value"
        alt="头像"
        class="h-33 w-24 shrink-0 rounded object-cover"
        :class="themeTemplate === 'modern' ? 'mb-2' : 'mr-3'"
      />
      <h1 class="min-w-0 max-w-full font-bold tracking-wide" :style="[fontValue(14)]">
        <Text v-model="user.name" />
      </h1>
      <!-- modern 风格：姓名下主题色短横线 -->
      <div
        v-if="themeTemplate === 'modern'"
        class="my-1 h-1 w-10 rounded-full"
        :style="{ background: themeColor }"
      ></div>
      <!-- 元信息行：default 撑满剩余宽度，modern 占满整行并居中，避免导出渲染时子项宽度取整触发换行错位 -->
      <div
        class="flex min-w-0 max-w-full flex-wrap items-center gap-3"
        :class="{ 'ml-0': themeTemplate === 'modern', 'flex-1': themeTemplate !== 'modern', 'w-full justify-center': themeTemplate === 'modern' }"
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
      <div v-if="hasPhone" class="flex min-w-0 max-w-full flex-wrap items-center">
        <SfIcon
          v-if="userInfoMode === 'icon'"
          icon="mdi:phone"
          size="3.5"
          class="mr-1 shrink-0"
        />
        <div v-else class="pr-1">电话：</div>
        <div class="min-w-0 max-w-full font-medium">
          <Text v-model="user.phone" />
        </div>
      </div>
      <div v-if="hasEmail" class="flex min-w-0 max-w-full flex-wrap items-center">
        <SfIcon
          v-if="userInfoMode === 'icon'"
          icon="mdi:email-outline"
          size="3.5"
          class="mr-1 shrink-0"
        />
        <div v-else class="pr-1">邮箱：</div>
        <div class="min-w-0 max-w-full font-medium">
          <Text v-model="user.email" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
