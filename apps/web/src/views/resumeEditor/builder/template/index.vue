<script setup>
import { computed } from "vue";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import ThumbPreview from "../preview/thumbPreview.vue";
import { themeTemplateList } from "@/stores/modules/resume/uiConfig";

const resumeStore = useResumeStore();
const { currentUI, currentData, currentConfig, currentFixedConfig } = storeToRefs(resumeStore);

// 遍历风格模板数组：同一份简历数据，逐套主题生成预览项
const templates = computed(() =>
  themeTemplateList.map((t) => ({
    name: t.name,
    value: t.value,
    item: {
      data: currentData.value,
      config: currentConfig.value,
      fixedConfig: currentFixedConfig.value,
      ui: { ...currentUI.value, themeTemplate: t.value },
    },
  })),
);

// 是否为当前选中的风格模板
const isActive = (value) => (currentUI.value?.themeTemplate ?? "default") === value;

// 应用风格：修改当前简历主题，预览层响应式渲染
const applyTemplate = (value) => {
  currentUI.value.themeTemplate = value;
};
</script>

<template>
  <div class="grid w-full grid-cols-2 gap-3">
    <div
      v-for="template in templates"
      :key="template.value"
      class="cursor-pointer! overflow-hidden rounded-xl border border-sf-b transition-all duration-300"
      :class="{ 'border-sf-theme-2': isActive(template.value) }"
      @click="applyTemplate(template.value)"
    >
      <div class="flex items-center justify-between p-3 pb-0">
        <span class="text-sm font-bold text-sf-text">{{ template.name }}</span>
        <SfIcon
          v-if="isActive(template.value)"
          icon="lucide:check"
          size="3"
          class="text-sf-theme"
        />
      </div>
      <!-- 模板简历缩略图：缩略区在卡片内 padding 中，宽高比与 A4 一致，随列宽自适应，页面完整显示填满 -->
      <div class="p-3">
        <div class="relative aspect-[794/1123] w-full overflow-hidden rounded-lg bg-sf-bg">
          <ThumbPreview :item="template.item" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
