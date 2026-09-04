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
    <template v-for="(item, index) in video" :key="index">
      <div
        class="mt-1 flex max-w-full min-w-0 flex-wrap items-center justify-between gap-2"
        data-module="user"
      >
        <DiffField v-model="item.name" />
        <div class="flex-1" :style="[fontValue(-6)]">
          <DiffField v-model="item.desc" />
        </div>
        <div class="h-16 w-16">
          <SfQrcode :value="item.url?.value" />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
