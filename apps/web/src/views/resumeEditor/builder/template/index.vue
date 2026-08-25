<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { themeTemplateList } from "@/stores/modules/resume/uiConfig";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 是否为当前选中的风格模板
const isActive = (value) => (currentUI.value?.themeTemplate ?? "default") === value;
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <div
      v-for="item in themeTemplateList"
      :key="item.value"
      class="cursor-pointer! rounded-xl border border-sf-b p-4 transition-all duration-300"
      :class="{
        'border-sf-theme-2 bg-sf-theme-3': isActive(item.value),
      }"
      @click="currentUI.themeTemplate = item.value"
    >
      <div class="mb-3 flex items-center justify-between">
        <span class="text-sm font-bold text-sf-text">{{ item.name }}</span>
        <SfIcon
          v-if="isActive(item.value)"
          icon="lucide:check"
          size="3"
          class="text-sf-theme"
        />
      </div>
      <!-- 标题样式预览 -->
      <div class="mb-3">
        <div
          v-if="item.value === 'default'"
          class="flex items-center border-b border-sf-b pb-2"
        >
          <div
            class="mr-2 h-3 w-1 rounded-full"
            :style="{ background: currentUI?.themeColor }"
          ></div>
          <span class="text-sm font-bold">教育经历</span>
        </div>
        <div
          v-else-if="item.value === 'modern'"
          class="border-b-4 pb-2"
          :style="{ borderColor: currentUI?.themeColor }"
        >
          <span class="text-sm font-bold">教育经历</span>
        </div>
        <div v-else class="border-y border-sf-b py-1 text-center">
          <span class="text-sm font-bold">教育经历</span>
        </div>
      </div>
      <!-- 内容样式预览 -->
      <div class="text-xs leading-5 text-sf-text-2">
        <span v-if="item.value === 'default'">示例内容：这里是正文段落展示</span>
        <span
          v-else-if="item.value === 'modern'"
          class="block border-l-2 pl-2"
          :style="{ borderColor: currentUI?.themeColor }"
        >示例内容：这里是正文段落展示</span>
        <span v-else class="block rounded-md bg-sf-bg px-3 py-1">示例内容：这里是正文段落展示</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
