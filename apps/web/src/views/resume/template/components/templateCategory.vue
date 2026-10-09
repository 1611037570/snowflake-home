<script setup>
import { resumeTemplateTopCategories } from "../data/list";
import { computed, ref } from "vue";

const emit = defineEmits(["change", "category-change", "size-change"]);

// 一级分类：简历范本与简历模板，默认展示简历范本
const currentTopCategory = ref(resumeTemplateTopCategories[0].key);
// 二级分类：当前一级分类下的筛选维度，默认取该分类的第一个维度
const currentCategoryKey = ref(resumeTemplateTopCategories[0].categories[0].key);
// 当前二级分类选中的选项，切换分类时清空
const selectedOptionKey = ref("");
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
</script>

<template>
  <section class="mb-3">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <nav class="flex flex-wrap gap-3">
        <SfButton
          v-for="top in resumeTemplateTopCategories"
          :key="top.key"
          :plain="currentTopCategory !== top.key"
          :round="true"
          :icon="top.icon"
          @click="selectTopCategory(top.key)"
        >
          {{ $t(`resumeTemplateTopCategory_${top.key}`) }}
        </SfButton>
      </nav>
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-bold text-sf-text-2">{{ $t("resumeTemplatePreviewSize") }}</span>
        <SfButton
          :plain="previewSize !== 'default'"
          :round="true"
          @click="selectPreviewSize('default')"
        >
          {{ $t("resumeTemplateSmallPreview") }}
        </SfButton>
        <SfButton
          :plain="previewSize !== 'small'"
          :round="true"
          @click="selectPreviewSize('small')"
        >
          {{ $t("resumeTemplateLargePreview") }}
        </SfButton>
      </div>
    </div>
    <!-- 二级分类只有一个维度时不再重复展示分类，直接展示它的选项 -->
    <div v-if="currentCategories.length > 1" class="mt-3 flex flex-wrap gap-3">
      <SfButton
        v-for="category in currentCategories"
        :key="category.key"
        size="small"
        :plain="currentCategoryKey !== category.key"
        :round="true"
        @click="selectCategory(category.key)"
      >
        {{ $t(`resumeTemplateCategory_${category.key}`) }}
      </SfButton>
    </div>
    <div class="mt-3 flex flex-wrap gap-3">
      <button
        v-for="option in currentOptions"
        :key="option.key"
        class="h-9 cursor-pointer text-sm leading-9 text-sf-text-2 transition-colors hover:text-sf-theme"
        :class="{ 'font-bold text-sf-theme': selectedOptionKey === option.key }"
        type="button"
        @click="toggleOption(option.key)"
      >
        {{ $t(`resumeTemplateOption_${currentCategory.key}_${option.key}`) }}
      </button>
    </div>
  </section>
</template>
