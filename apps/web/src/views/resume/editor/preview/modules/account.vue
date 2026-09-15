<script setup>
import { computed, inject } from "vue";
import ResumeField from "../components/resumeField/index.vue";
import { getValidData } from "./validData";

// 从上层注入获取原始简历数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 数组记录统一由 getValidData 过滤并提取业务内容
const account = computed(() => getValidData(previewData.value?.account?.data || []));

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
  <div
    class="resume-row flex flex-col gap-3"
    data-module="account"
    :style="[lineHeightValue(), fontValue()]"
  >
    <!-- 社交链接 -->
    <div
      v-for="(item, index) in account"
      :key="index"
      class="max-w-full min-w-0"
      data-module="user"
    >
      <span
        v-if="item.name"
        class="inline-block whitespace-nowrap"
      >
        <ResumeField :model-value="item.name" class="inline" />
        <span v-if="item.url">：</span>
      </span>
      <a
        :href="safeUrl(item.url)"
        target="_blank"
        rel="noopener noreferrer"
        class="inline max-w-full min-w-0 break-all hover:underline"
      >
        <ResumeField
          :model-value="item.url"
          class="inline max-w-full min-w-0 break-all"
        />
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
