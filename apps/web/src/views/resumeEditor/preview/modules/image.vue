<script setup>
import { computed, inject } from "vue";
import ResumeField from "../components/resumeField/index.vue";
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
  <div
    class="resume-row flex w-full flex-wrap items-start gap-3"
    data-module="image"
    :style="[lineHeightValue(), fontValue()]"
  >
    <!-- 模块根作为 flex 容器：作品卡片并排渲染、超出自动换行，且每个卡片独立成行便于分页识别 -->
    <!-- 标题栏：占满整行 -->
    <div class="w-full shrink-0">
      <Title title="图片作品"></Title>
    </div>
    <!-- 单个作品：图片在上、名称在下，暂不展示描述 -->
    <template v-for="(item, index) in images" :key="index">
      <div class="flex min-w-0 flex-col gap-1" :style="{ width: `${item.size?.value ?? 50}%` }">
        <img
          v-if="item.img?.value"
          :src="toAvatarSrc(item.img?.value)"
          alt="图片作品"
          class="h-auto w-full rounded"
        />
        <ResumeField class="text-center" v-model="item.name" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
