<script setup>
import { computed, inject } from "vue";
import Text from "./text.vue";

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 代理数据解包访问数组
const account = computed(() => previewData.value?.account?.data || []);
</script>

<template>
  <div class="resume-row" data-module="account" :style="[lineHeightValue(), fontValue()]">
    <!-- 社交链接 -->
    <div
      v-for="(item, index) in account"
      :key="index"
      class="mt-1 flex items-center gap-2"
      data-module="user"
    >
      <Text v-model="item.name" />
      <span v-if="item.name?.value && item.url?.value" class="pr-1">：</span>
      <a :href="item.url?.value" target="_blank" class="font-medium hover:underline">
        <Text v-model="item.url" />
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
