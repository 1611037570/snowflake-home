<script setup>
import { computed } from "vue";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import ResumePages from "@/views/resumeEditor/preview/resumePages.vue";
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
  <div class="flex w-full flex-col gap-4">
    <div
      v-for="template in templates"
      :key="template.value"
      class="cursor-pointer! overflow-hidden rounded-xl border border-sf-b transition-all duration-300"
      :class="{ 'border-sf-theme-2': isActive(template.value) }"
      @click="applyTemplate(template.value)"
    >
      <div class="flex items-center justify-between px-4 pt-3">
        <span class="text-sm font-bold text-sf-text">{{ template.name }}</span>
        <SfIcon
          v-if="isActive(template.value)"
          icon="lucide:check"
          size="3"
          class="text-sf-theme"
        />
      </div>
      <!-- 模板简历缩略图：A4 页面缩放至卡片宽度，居中覆盖裁切超出部分 -->
      <div class="pointer-events-none relative mx-4 my-3 h-[400px] overflow-hidden rounded-lg bg-sf-bg">
        <div class="flex h-full w-full items-center justify-center select-none">
          <div class="origin-center" style="transform: scale(0.36)">
            <ResumePages :item="template.item" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
