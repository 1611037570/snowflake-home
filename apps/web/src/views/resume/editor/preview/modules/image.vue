<script setup>
import { computed, inject } from "vue";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../components/title/index.vue";
import { getPreviewTitle } from "../i18n";
import { getValidData } from "./validData";

// 从上层注入获取原始简历数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
const paragraphSpacingStyle = inject("paragraphSpacingStyle");
const previewLang = inject(
  "previewLang",
  computed(() => "zh"),
);
const imageAlt = computed(() => getPreviewTitle("image", previewLang.value));

// 数组记录统一由 getValidData 过滤并提取业务内容
const images = computed(() => getValidData(previewData.value?.image?.data || []));
</script>

<template>
  <div
    class="resume-row flex w-full flex-wrap items-start gap-x-3"
    data-module="image"
    :style="[lineHeightValue(), fontValue()]"
  >
    <!-- 模块根作为 flex 容器：作品卡片并排渲染、超出自动换行，且每个卡片独立成行便于分页识别 -->
    <!-- 标题栏：占满整行 -->
    <div class="w-full shrink-0">
      <Title module-key="image"></Title>
    </div>
    <!-- 单个作品：图片在上、名称在下，暂不展示描述 -->
    <template v-for="(item, index) in images" :key="index">
      <div
        :style="[paragraphSpacingStyle, { width: `${item.size ?? 50}%` }]"
        class="flex min-w-0 flex-col gap-1"
      >
        <img v-if="item.img" :src="item.img" :alt="imageAlt" class="h-auto w-full rounded" />
        <ResumeField class="text-center" :model-value="item.name" />
        <ResumeField class="text-center" :model-value="item.desc" />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
