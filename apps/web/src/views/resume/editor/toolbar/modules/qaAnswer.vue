<script setup>
import { computed, ref } from "vue";
import { isChrome } from "@/utils";
import { DOWNLOAD_URL, RECOMMEND_BROWSER } from "@/components/business/browserTip";

// QA 解答弹窗可见性
const visible = ref(false);
// 非推荐浏览器：QA 图标切换为感叹号，弹窗内展示浏览器建议
const notChrome = computed(() => !isChrome());
</script>

<template>
  <!-- 右侧工具栏区域的 QA 解答入口 -->
  <div class="absolute -bottom-12 left-1/2 -translate-x-1/2">
    <SfTooltip content="QA解答" placement="left">
      <SfIcon
        :icon="notChrome ? 'mdi:alert-circle' : 'mdi:chat-question-outline'"
        size="5"
        boxSize="10"
        :class="
          notChrome
            ? 'relative cursor-pointer rounded-full bg-sf-warning-2 text-sf-warning'
            : 'relative cursor-pointer rounded-full bg-gradient-to-br from-sf-theme to-sf-theme-2 text-sf-theme-text'
        "
        @click="visible = true"
      />
    </SfTooltip>
  </div>

  <!-- QA 解答弹窗：内容待补充 -->
  <SfModal v-model="visible" title="QA解答">
    <div class="flex w-[400px] flex-col gap-5 p-4">
      <!-- 浏览器建议：非推荐浏览器时展示推荐与下载入口 -->
      <div
        class="flex flex-col items-start gap-2 rounded-xl bg-sf-warning-2 p-3 text-sm text-sf-warning"
      >
        <span
          >推荐使用{{ RECOMMEND_BROWSER }}获得最佳体验，其他浏览器可能会遇到兼容性或性能问题。</span
        >
        <a
          :href="DOWNLOAD_URL"
          target="_blank"
          class="rounded-full bg-sf-warning px-3 py-1 text-sf-theme-text"
          >去下载{{ RECOMMEND_BROWSER }}</a
        >
      </div>
      <!-- 内容区：待补充 -->
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
