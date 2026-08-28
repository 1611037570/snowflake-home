<script setup>
import { computed, inject } from "vue";
import Content from "../theme/content.vue";
import Title from "../theme/title.vue";
import Text from "./text.vue";

import { getTime } from "../../utils";

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 代理数据解包，直接访问原数组（数组项已被代理，保持引用稳定）
const education = computed(() => {
  const list = previewData.value?.education?.data || [];
  return list;
});

// 判断是否有某项字段（用于渲染 infoList 的分隔点）
const hasField = (item, key) => {
  const v = item?.[key]?.value;
  return v && typeof v === "string" && v.trim();
};
</script>

<template>
  <div class="resume-row w-full" data-module="education" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title title="教育经历"></Title>
    <!-- 内容区：直接渲染代理数组项，不做 map 拷贝 -->
    <template v-for="(item, index) in education" :key="index">
      <div
        class="mt-2 flex flex-wrap items-center justify-between"
        v-if="item.name?.value || getTime(item.time?.value)"
      >
        <div class="flex min-w-0 max-w-full flex-wrap items-baseline gap-4">
          <div class="font-bold" :style="[fontValue(3)]">
            <Text v-model="item.name" />
          </div>
        </div>
        <div class="flex min-w-0 max-w-full flex-wrap items-center gap-2">
          <Text v-model="item.time" :display-value="getTime(item.time?.value)" />
        </div>
      </div>
      <!-- 次信息行：post / education / mode，不创建临时对象，直接基于原字段渲染 -->
      <div
        class="mt-1 flex min-w-0 max-w-full flex-wrap items-center gap-2"
        v-if="hasField(item, 'post') || hasField(item, 'education') || hasField(item, 'mode')"
      >
        <template v-if="hasField(item, 'education')">
          <Text v-model="item.education" />
        </template>
        <template v-if="hasField(item, 'post')">
          <div
            v-if="hasField(item, 'education')"
            class="h-1 w-1 rounded-full bg-black"
          ></div>
          <Text v-model="item.post" />
        </template>
        <template v-if="hasField(item, 'mode')">
          <div
            v-if="hasField(item, 'education') || hasField(item, 'post')"
            class="h-1 w-1 rounded-full bg-black"
          ></div>
          <Text v-model="item.mode" />
        </template>
      </div>
      <!-- 补充描述/经历 -->
      <Content :content="item.content?.value ?? ''" />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
