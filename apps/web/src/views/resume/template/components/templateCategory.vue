<script setup>
import { resumeTemplateList, resumeTemplateTopCategories } from "../data/list";
import { resumeStyleTemplateList } from "@/views/resume/theme";
import { computed, ref } from "vue";

// 一级分类容量：回答「这一栏有多少」，取全量条数，不随筛选变化
const topCategoryCounts = {
  example: resumeTemplateList.length,
  template: resumeStyleTemplateList.length,
};

// 页签仅派生真实数量，统一使用面板的主题色与中性色。
const topCategoryCards = computed(() =>
  resumeTemplateTopCategories.map((top) => ({
    ...top,
    count: topCategoryCounts[top.key], // 分类内的真实条目数量
  })),
);

const emit = defineEmits(["change", "category-change", "size-change"]);

// 一级分类：简历模板与简历范本，默认展示简历模板
const currentTopCategory = ref(resumeTemplateTopCategories[0].key);
// 二级分类：当前一级分类下的筛选维度，默认取该分类的第一个维度
const currentCategoryKey = ref(resumeTemplateTopCategories[0].categories[0].key);
// 当前二级分类选中的选项，切换分类时清空
const selectedOptionKey = ref("");
const selectedLayoutKey = ref(""); // 简历模板选中的布局标签
const selectedTierKey = ref(""); // 简历模板选中的类型标签
const previewSize = ref("default");
const currentTop = computed(
  () =>
    resumeTemplateTopCategories.find((top) => top.key === currentTopCategory.value) ||
    resumeTemplateTopCategories[0],
);
const currentCategories = computed(() => currentTop.value.categories);
const currentCategory = computed(
  () =>
    currentCategories.value.find((category) => category.key === currentCategoryKey.value) ||
    currentCategories.value[0],
);
const currentOptions = computed(() => currentCategory.value.options);
// 切换一级分类：回到该分类的第一个维度并清空筛选，避免另一类的筛选条件残留
const selectTopCategory = (key) => {
  const top = resumeTemplateTopCategories.find((item) => item.key === key);
  currentTopCategory.value = key;
  currentCategoryKey.value = top.categories[0].key;
  selectedOptionKey.value = "";
  selectedLayoutKey.value = "";
  selectedTierKey.value = "";
  emit("category-change", key);
  emit("change", {});
};
// 切换二级分类：不同维度互斥，切换时清空已选选项
const selectCategory = (key) => {
  currentCategoryKey.value = key;
  selectedOptionKey.value = "";
  emit("change", {});
};
const selectPreviewSize = (size) => {
  previewSize.value = size;
  emit("size-change", size);
};
// 选项再次点击取消选中；筛选键取当前二级分类标识，与模板数据字段同名
const toggleOption = (key) => {
  selectedOptionKey.value = selectedOptionKey.value === key ? "" : key;
  emit(
    "change",
    selectedOptionKey.value ? { [currentCategory.value.key]: selectedOptionKey.value } : {},
  );
};
// 简历模板的布局与类型互不清空，同时选中时按两个标签共同筛选。
const toggleTemplateOption = (categoryKey, key) => {
  const selected = categoryKey === "layout" ? selectedLayoutKey : selectedTierKey;
  selected.value = selected.value === key ? "" : key;
  emit("change", {
    ...(selectedLayoutKey.value ? { layout: selectedLayoutKey.value } : {}), // 当前布局筛选值
    ...(selectedTierKey.value ? { tier: selectedTierKey.value } : {}), // 当前类型筛选值
  });
};
// 模板类型数量直接按主题分类标签统计，主题清单变化后自动更新。
const getTemplateTypeCount = (key) =>
  resumeStyleTemplateList.filter((template) => template.design.includes(key)).length;
</script>

<template>
  <!-- 分类和筛选收进同一面板，压缩空白并建立明确的内容边界。 -->
  <section class="mb-6 rounded-xl border border-sf-b bg-sf-primary p-3 sm:px-6">
    <div class="flex flex-col gap-3 border-b border-sf-b pb-3 md:flex-row md:items-center md:justify-between">
      <!-- 分类采用文字页签，数量作为小角标，不再占据独立卡片。 -->
      <nav class="flex flex-wrap gap-6">
        <button
          v-for="top in topCategoryCards"
          :key="top.key"
          type="button"
          class="relative flex h-9 cursor-pointer items-center gap-[6px] text-sm transition-colors after:absolute after:inset-x-0 after:-bottom-3 after:h-0.5 after:rounded-full after:bg-sf-theme"
          :class="
            currentTopCategory === top.key ? 'font-semibold text-sf-theme after:opacity-100' : 'font-normal text-sf-text-2 after:opacity-0 hover:text-sf-text'
          "
          @click="selectTopCategory(top.key)"
        >
          <span>{{ $t(`resumeTemplateTopCategory_${top.key}`) }}</span>
          <span class="rounded bg-sf-bg px-[6px] py-[3px] text-[11px] leading-none font-normal text-sf-text-3 tabular-nums">{{ top.count }}</span>
        </button>
      </nav>
      <!-- 尺寸切换降低视觉权重，两档使用一致的点击区域。 -->
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-xs text-sf-text-3">{{ $t("resumeTemplatePreviewSize") }}</span>
        <div class="flex gap-[3px] rounded-md bg-sf-bg p-[3px]">
          <button
            type="button"
            class="h-6 cursor-pointer rounded px-3 text-xs transition-colors"
            :class="previewSize === 'default' ? 'bg-sf-primary font-medium text-sf-text' : 'text-sf-text-2 hover:text-sf-text'"
            :aria-pressed="previewSize === 'default'"
            @click="selectPreviewSize('default')"
          >
            {{ $t("resumeTemplateSmallPreview") }}
          </button>
          <button
            type="button"
            class="h-6 cursor-pointer rounded px-3 text-xs transition-colors"
            :class="previewSize === 'small' ? 'bg-sf-primary font-medium text-sf-text' : 'text-sf-text-2 hover:text-sf-text'"
            :aria-pressed="previewSize === 'small'"
            @click="selectPreviewSize('small')"
          >
            {{ $t("resumeTemplateLargePreview") }}
          </button>
        </div>
      </div>
    </div>
    <!-- 二级维度用下划线页签：下划线只出现在这一层，专门标识当前选中的维度；
         该维度只有一个时不再重复展示，直接展示它的选项 -->
    <div
      v-if="currentTopCategory !== 'template' && currentCategories.length > 1"
      class="mt-3 flex flex-wrap items-center gap-6 border-b border-sf-b"
    >
      <button
        v-for="category in currentCategories"
        :key="category.key"
        type="button"
        class="-mb-px cursor-pointer border-b-2 pb-3 text-sm transition-colors"
        :class="
          currentCategoryKey === category.key
            ? 'border-sf-theme font-medium text-sf-theme'
            : 'border-transparent text-sf-text-2 hover:text-sf-theme'
        "
        @click="selectCategory(category.key)"
      >
        {{ $t(`resumeTemplateCategory_${category.key}`) }}
      </button>
    </div>
    <!-- 筛选选项使用轻背景区分选中态，与上层分类保持明确层级。 -->
    <div v-if="currentTopCategory !== 'template'" class="mt-3 flex flex-wrap gap-[3px]">
      <button
        v-for="option in currentOptions"
        :key="option.key"
        class="cursor-pointer rounded-md px-3 py-[6px] text-sm transition-colors"
        :class="
          selectedOptionKey === option.key
            ? 'bg-sf-theme-3 font-medium text-sf-theme'
            : 'text-sf-text-2 hover:bg-sf-bg hover:text-sf-text'
        "
        type="button"
        @click="toggleOption(option.key)"
      >
        {{ $t(`resumeTemplateOption_${currentCategory.key}_${option.key}`) }}
      </button>
    </div>
    <!-- 标签与选项收紧横向留白，两行仍保持起点对齐。 -->
    <div v-else class="mt-3 flex flex-col gap-[6px]">
      <div v-for="category in currentCategories" :key="category.key" class="flex items-center gap-[6px]">
        <span class="w-9 shrink-0 text-xs text-sf-text-3">
          {{ $t(`resumeTemplateCategory_${category.key}`) }}
        </span>
        <div class="flex min-w-0 flex-nowrap gap-[3px] overflow-x-auto whitespace-nowrap">
          <button
            v-for="option in category.options"
            :key="option.key"
            type="button"
            class="cursor-pointer rounded-md px-[6px] py-[6px] text-sm transition-colors"
            :class="
              (category.key === 'layout' ? selectedLayoutKey : selectedTierKey) === option.key
                ? 'bg-sf-theme-3 font-medium text-sf-theme'
                : 'text-sf-text-2 hover:bg-sf-bg hover:text-sf-text'
            "
            @click="toggleTemplateOption(category.key, option.key)"
          >
            {{ $t(`resumeTemplateOption_design_${option.key}`) }}
            <span v-if="category.key === 'tier'" class="ml-[6px] text-xs text-sf-text-3 tabular-nums">{{ getTemplateTypeCount(option.key) }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
