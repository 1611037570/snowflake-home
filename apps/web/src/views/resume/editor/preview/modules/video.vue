<script setup>
import { computed, inject } from "vue";
import Title from "../components/title/index.vue";
import ResumeField from "../components/resumeField/index.vue";
import { getValidData } from "./validData";
import ItemTitle from "../components/itemTitle.vue";

// 从上层注入获取原始简历数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
const paragraphSpacingStyle = inject("paragraphSpacingStyle");

// 数组记录统一由 getValidData 过滤并提取业务内容
const video = computed(() => getValidData(previewData.value?.video?.list || []));
</script>

<template>
  <div class="resume-row" data-module="video" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title module-key="video"></Title>
    <!-- 社交链接 -->
    <template v-for="(item, index) in video" :key="index">
      <div
        :style="paragraphSpacingStyle"
        class="flex h-auto max-w-full min-w-0 flex-wrap items-center justify-between gap-2"
        data-module="user"
      >
        <div class="flex flex-1 items-center gap-3" :style="[fontValue()]">
          <ItemTitle :name="item.name" />
          <ResumeField :model-value="item.desc" />
        </div>
        <div class="h-16 w-16" v-if="item.url">
          <SfQrcode :value="item.url" />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
