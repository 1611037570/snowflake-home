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
const linkUnderline = inject("linkUnderline", computed(() => false));

// 数组记录统一由 getValidData 过滤并提取业务内容
const video = computed(() => getValidData(previewData.value?.video?.list || []));
</script>

<template>
  <div class="resume-row" data-module="video" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title module-key="video"></Title>
    <!-- 视频作品：右侧统一展示可直接点击的原始链接，二维码暂时保留注释 -->
    <template v-for="(item, index) in video" :key="index">
      <div
        :style="paragraphSpacingStyle"
        class="flex h-auto max-w-full min-w-0 flex-wrap items-center justify-between gap-3"
      >
        <div class="flex min-w-0 flex-1 flex-col gap-3" :style="[fontValue()]">
          <div class="flex min-w-0 flex-wrap items-center gap-3">
            <ItemTitle :name="item.name" />
            <ResumeField :model-value="item.desc" />
          </div>
        </div>
        <div v-if="item.url" class="max-w-[45%] min-w-0 shrink-0 text-right">
          <a
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline max-w-full min-w-0 break-all hover:underline"
            :class="{ underline: linkUnderline }"
          >
            <ResumeField :model-value="item.url" class="inline max-w-full min-w-0 break-all" />
          </a>
          <!-- 后续如需纸质简历扫码，可恢复二维码展示 -->
          <!-- <div class="mt-3 ml-auto h-16 w-16"><SfQrcode :value="item.url" /></div> -->
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
