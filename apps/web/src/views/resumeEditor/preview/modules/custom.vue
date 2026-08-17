<script setup>
import { computed, inject } from "vue";
import { getTime } from "../../utils";
import Content from "../theme/content.vue";
import Title from "../theme/title.vue";
import Text from "./text.vue";

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 代理数据解包访问自定义模块数组
const customList = computed(() => previewData.value?.custom || []);
</script>

<template>
  <div class="resume-row" data-module="custom" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏（自定义模块无固定标题，这里使用占位以保持结构一致；具体标题可由上层提供） -->
    <Title title="自定义模块"></Title>
    <!-- 内容区 -->
    <template v-for="(item, index) in customList" :key="index">
      <div class="mb-3 flex items-center justify-between" :style="[lineHeightValue(3)]">
        <div class="flex items-center gap-4">
          <div class="font-bold" :style="[fontValue(3)]">
            <Text v-model="item.name" />
          </div>
          <div v-if="item.post?.value">
            <Text v-model="item.post" />
          </div>
        </div>
        <div class="flex items-center">
          <Text v-model="item.time" :display-value="getTime(item.time?.value)" />
        </div>
      </div>
      <!-- 补充描述/经历 -->
      <Content :content="item.content?.value ?? ''" />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
