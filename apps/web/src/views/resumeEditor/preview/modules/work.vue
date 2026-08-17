<script setup>
import Title from "../theme/title.vue";

import { computed, inject } from "vue";
import Content from "../theme/content.vue";
import Text from "./text.vue";

import { getTime } from "../../utils";

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 代理数据解包访问数组
const workList = computed(() => previewData.value?.work || []);
</script>

<template>
  <div class="resume-row" data-module="work" :style="[lineHeightValue(), fontValue()]">
    <Title title="工作经历" />
    <template v-for="(item, index) in workList" :key="index">
      <div class="flex items-center justify-between" :style="[lineHeightValue(3)]">
        <div class="flex items-center gap-4">
          <div class="font-bold" :style="[fontValue(3)]">
            <Text v-model="item.name" />
          </div>
          <div>
            <Text v-model="item.post" />
          </div>
        </div>
        <div class="flex items-center">
          <Text v-model="item.time" :display-value="getTime(item.time?.value)" />
        </div>
      </div>
      <Content :content="item.content?.value ?? ''" />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
