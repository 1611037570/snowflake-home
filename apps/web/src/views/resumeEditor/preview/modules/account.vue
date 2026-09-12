<script setup>
import { computed, inject } from "vue";
import ResumeField from "../components/resumeField/index.vue";

// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

// 代理数据解包访问数组
const account = computed(() => previewData.value?.account?.data || []);

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
        v-if="item.name?.value"
        class="inline-block whitespace-nowrap"
      >
        <ResumeField v-model="item.name" class="inline" />
        <span v-if="item.url?.value">：</span>
      </span>
      <a
        :href="safeUrl(item.url?.value)"
        target="_blank"
        rel="noopener noreferrer"
        class="inline max-w-full min-w-0 break-all hover:underline"
      >
        <ResumeField
          v-model="item.url"
          class="inline max-w-full min-w-0 break-all"
        />
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
