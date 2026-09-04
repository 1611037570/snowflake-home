<script setup>
import { computed, inject } from "vue";
import Title from "../theme/title/index.vue";
import DiffField from "../components/diffField/index.vue";

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 代理数据解包访问数组
const video = computed(() => previewData.value?.video?.data || []);

// 仅允许安全的外部链接协议
const safeUrl = (value) => {
  if (!value) return "";
  try {
    const url = new URL(String(value).trim());
    return ["http:", "https:", "mailto:"].includes(url.protocol.toLowerCase()) ? url.href : "";
  } catch {
    return "";
  }
};
</script>

<template>
  <div class="resume-row" data-module="video" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title title="视频作品"></Title>
    <!-- 社交链接 -->
    <div
      v-for="(item, index) in video"
      :key="index"
      class="mt-1 flex max-w-full min-w-0 flex-wrap items-center gap-2"
      data-module="user"
    >
      <DiffField v-model="item.name" />
      <span v-if="item.name?.value && item.url?.value" class="pr-1">：</span>
      <a
        :href="safeUrl(item.url?.value)"
        target="_blank"
        rel="noopener noreferrer"
        class="max-w-full min-w-0 font-medium hover:underline"
      >
        <DiffField v-model="item.url" />
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
