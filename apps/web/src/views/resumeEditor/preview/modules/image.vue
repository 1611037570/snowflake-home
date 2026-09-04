<script setup>
import { computed, inject } from "vue";
import DiffField from "../components/diffField/index.vue";
import Title from "../theme/title/index.vue";
import { toAvatarSrc } from "@/utils";

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 代理数据解包访问数组
const images = computed(() => previewData.value?.image?.data || []);
</script>

<template>
  <div class="resume-row w-full" data-module="image" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title title="图片作品"></Title>
    <!-- 图片作品列表：名称与描述格式同视频模块，图片宽度按 size 百分比展示 -->
    <template v-for="(item, index) in images" :key="index">
      <div class="mt-1 flex max-w-full min-w-0 flex-wrap items-center justify-between gap-2">
        <DiffField v-model="item.name" />
        <div class="flex-1" :style="[fontValue(-6)]">
          <DiffField v-model="item.desc" />
        </div>
        <div
          v-if="item.img?.value"
          class="shrink-0"
          :style="{ width: `${item.size?.value ?? 50}%` }"
        >
          <img
            :src="toAvatarSrc(item.img?.value)"
            alt="图片作品"
            class="h-auto w-full rounded"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
