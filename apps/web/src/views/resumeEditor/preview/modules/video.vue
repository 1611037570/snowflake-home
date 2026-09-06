<script setup>
import { computed, inject } from "vue";
import Title from "../theme/title/index.vue";
import ResumeField from "../components/resumeField/index.vue";

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 代理数据解包访问数组
const video = computed(() => previewData.value?.video?.data || []);

</script>

<template>
  <div class="resume-row" data-module="video" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title title="视频作品"></Title>
    <!-- 社交链接 -->
    <template v-for="(item, index) in video" :key="index">
      <div
        class="mt-1 flex h-auto max-w-full min-w-0 flex-wrap items-center justify-between gap-2"
        data-module="user"
      >
        <div class="flex flex-1 items-center gap-3" :style="[fontValue(-6)]">
          <ResumeField v-model="item.name" :style="[fontValue(1)]" />
          <ResumeField v-model="item.desc" />
        </div>
        <div class="h-16 w-16">
          <SfQrcode :value="item.url?.value" />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
