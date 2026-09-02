<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import ThumbPreview from "../../preview/thumbPreview.vue";
import { themeTemplateList } from "@/stores/modules/resume/uiConfig";
import { xiaoYangResumeItem } from "@/stores/modules/resume/xiaoYangData";

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 遍历风格模板数组：同一份小羊示例数据，逐套主题生成预览项（与当前编辑内容解耦）
const templates = themeTemplateList.map((t) => ({
  name: t.name,
  value: t.value,
  item: {
    data: xiaoYangResumeItem.data,
    config: xiaoYangResumeItem.config,
    fixedConfig: xiaoYangResumeItem.fixedConfig,
    ui: { ...xiaoYangResumeItem.ui, themeTemplate: t.value },
  },
}));

// 是否为当前选中的风格模板
const isActive = (value) => (currentUI.value?.themeTemplate ?? "default") === value;

// 应用风格：修改当前简历主题，预览层响应式渲染
const applyTemplate = (value) => {
  currentUI.value.themeTemplate = value;
};
</script>

<template>
  <SfScrollbar class="h-full">
    <div class="grid w-full grid-cols-3 gap-1">
      <div
        v-for="template in templates"
        :key="template.value"
        class="group cursor-pointer!"
        @click="applyTemplate(template.value)"
      >
        <!-- 模板简历缩略图：缩略区在卡片内 padding 中，宽高比与 A4 一致，随列宽自适应，页面完整显示填满 -->
        <div
          class="relative h-[193px] w-[136px] overflow-hidden rounded-3xl border-2 border-sf-transparent bg-sf-bg"
          :class="{ ' border-sf-theme!': isActive(template.value) }"
        >
          <ThumbPreview
            :item="template.item"
            :show-actions="true"
            @select="applyTemplate(template.value)"
          />
          <div class="absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
            <SfIcon
              v-if="isActive(template.value)"
              icon="lucide:check"
              size="18"
              class="text-sf-theme"
            />
          </div>
        </div>
        <div class="flex items-center justify-center pt-1">
          <span class="text-sm font-bold text-sf-text">{{ template.name }}</span>
        </div>
      </div>
    </div>
  </SfScrollbar>
</template>

<style lang="scss" scoped></style>
