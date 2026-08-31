<script setup>
import { computed, inject } from "vue";
import { getTime } from "../../utils";
import Content from "../theme/content.vue";
import Title from "../theme/title/index.vue";
import Text from "./text.vue";

// 属性：模块标识、标题、数据 key
const props = defineProps({
  moduleName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  dataKey: {
    type: String,
    required: true,
  },
});

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 代理数据解包访问数组
const list = computed(() => previewData.value?.[props.dataKey]?.data || []);
</script>

<template>
  <div class="resume-row" :data-module="moduleName" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title :title="title"></Title>
    <!-- 内容区 -->
    <template v-for="(item, index) in list" :key="index">
      <div class="flex flex-wrap items-center justify-between">
        <!-- 信息容器撑满行内剩余宽度，避免导出渲染时子项宽度取整触发换行错位 -->
        <div class="flex min-w-0 max-w-full flex-1 flex-wrap items-center gap-4">
          <div class="font-bold" :style="[fontValue(3)]">
            <Text v-model="item.name" />
          </div>
          <div>
            <Text v-model="item.post" />
          </div>
        </div>
        <div class="flex min-w-0 max-w-full flex-wrap items-center">
          <Text v-model="item.time" :display-value="getTime(item.time?.value)" />
        </div>
      </div>
      <!-- 补充描述/经历 -->
      <Content :content="item.content?.value ?? ''" />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
