<script setup>
import { computed, inject } from "vue";
import DiffField from "../components/diffField/index.vue";
import Title from "../theme/title/index.vue";

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 代理数据解包访问数组
const honors = computed(() => previewData.value?.honor?.data || []);
</script>

<template>
  <div class="resume-row" data-module="honor" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title title="荣誉证书"></Title>
    <!-- 荣誉证书名称流式排列：容器放不下时才换行 -->
    <div v-if="honors.length" class="mt-1 flex max-w-full min-w-0 flex-wrap items-center gap-2">
      <template v-for="(item, index) in honors" :key="index">
        <DiffField v-model="item.name" />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
