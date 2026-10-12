<script setup>
// 显式命名模板组件，供父级 KeepAlive 按 include 命中缓存
defineOptions({ name: "BuilderTemplate" });
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import ThumbPreview from "../../preview/modes/thumb.vue";
import { createResumeStyleUi, resumeStyleTemplateList } from "@/views/resume/theme";
import { loadResumeTemplateData } from "@/views/resume/template/data/resumeData";
import { resumeTemplateDesignOptions } from "@/views/resume/template/data/list";
import { onMounted, ref } from "vue";
import i18n, { $t } from "@/locales";
const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);
const previewBase = ref(null);
const selectedDesign = ref(""); // 当前设计分类，空值时暂不展示极简和简约主题

// 与模板库共用设计分类参数，再次点击当前分类恢复全部模板。
const toggleDesign = (key) => {
  selectedDesign.value = selectedDesign.value === key ? "" : key;
};

// 进入样式选择时再加载一份范本作为预览内容。
onMounted(async () => {
  try {
    previewBase.value = await loadResumeTemplateData("xiaoZhou.ts");
  } catch {
    ElMessage.error($t("previewLoadFailed"));
  }
});

// 模板清单与模板库共用真实主题列表。
const templates = computed(() => {
  // 读取当前语言以便语言切换时重新生成模板名称。
  if (!i18n.global.locale.value) return [];
  return resumeStyleTemplateList
    .filter((style) => {
      // 未选择分类时隐藏极简模板，选中极简分类后再按标签筛选。
      if (!selectedDesign.value) return !style.design.includes("plain");
      return style.design.includes("all") || style.design.includes(selectedDesign.value);
    })
    .map((style) => ({
      name: $t(`resumeTemplateStyle_${style.localeId}_name`),
      id: style.id,
      item: {
        data: previewBase.value?.data || {},
        config: previewBase.value?.config || {},
        ui: style.ui,
      },
    }));
});

// 选中状态只由主题编号决定，复用相同标题样式的主题互不影响。
const isActive = (id) => (currentUI.value?.theme?.template ?? "default") === id;

// 应用风格：修改当前简历主题，预览层响应式渲染
const applyTemplate = (template) => {
  const moduleKeys = resumeStore.runtimeFields.map((field) => field.key).filter(Boolean);
  // 切换外观保留简历展示语言，其余参数使用独立主题的完整预设。
  currentUI.value = createResumeStyleUi(template.item.ui, moduleKeys, currentUI.value.content.language);
};
</script>

<template>
  <SfScrollbar class="h-full bg-sf-primary py-3">
    <!-- 编辑器分类沿用模板库选项与文案，以样式模板的 design 字段筛选。 -->
    <div class="mb-3 flex flex-wrap gap-3">
      <SfButton
        v-for="option in resumeTemplateDesignOptions"
        :key="option.key"
        :plain="selectedDesign !== option.key"
        round
        :aria-pressed="selectedDesign === option.key"
        @click="toggleDesign(option.key)"
      >
        {{ $t(`resumeTemplateOption_design_${option.key}`) }}
      </SfButton>
    </div>
    <!-- 模板卡片按可用宽度自动换列，保持缩略图的固定尺寸。 -->
    <div class="grid w-full grid-cols-[repeat(auto-fit,minmax(156px,1fr))] gap-3">
      <div
        v-for="template in templates"
        :key="template.id"
        class="group cursor-pointer!"
        @click="applyTemplate(template)"
      >
        <!-- 模板缩略图外框与简历页面保持相同宽高比，完整显示页面内容。 -->
        <div
          class="relative mx-auto h-[218px] w-[156px] overflow-hidden rounded-[4px] border-3 border-sf-transparent bg-sf-bg"
          :class="{ ' border-sf-theme!': isActive(template.id) }"
        >
          <ThumbPreview :item="template.item" @select="applyTemplate(template)" />
          <div class="absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
            <SfIcon
              v-if="isActive(template.id)"
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
    <div
      v-if="!templates.length"
      class="flex h-36 items-center justify-center text-sm text-sf-text-2"
    >
      {{ $t("resumeTemplateEmpty") }}
    </div>
  </SfScrollbar>
</template>

<style lang="scss" scoped></style>
