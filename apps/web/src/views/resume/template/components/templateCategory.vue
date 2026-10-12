<script setup>
import { resumeTemplateList, resumeTemplateTopCategories } from "../data/list";
import { resumeStyleTemplateList } from "@/views/resume/theme";
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { darkThemeColors, lightThemeColors } from "@/configs/modules/theme";
import { useThemeStore } from "@/stores/modules/theme";

// 一级分类容量：回答「这一栏有多少」，取全量条数，不随筛选变化
const topCategoryCounts = {
  example: resumeTemplateList.length,
  template: resumeStyleTemplateList.length,
};

// 一级分类卡片的图标配色：按色名去配置的彩虹色里定位，两类各一种色、不做统一
const TOP_CATEGORY_COLOR_NAME = { example: "浅晶蓝", template: "淡柔紫" };
const { isDark } = storeToRefs(useThemeStore());
// 亮色模式用浅色底配同色系的饱和图标，暗色模式两者对调，两种模式下都够清晰
const topCategoryCards = computed(() =>
  resumeTemplateTopCategories.map((top) => {
    const index = lightThemeColors.findIndex(
      (color) => color.name === TOP_CATEGORY_COLOR_NAME[top.key],
    );
    return {
      ...top,
      count: topCategoryCounts[top.key],
      tileColor: isDark.value ? darkThemeColors[index].value : lightThemeColors[index].value,
      iconColor: isDark.value ? lightThemeColors[index].value : darkThemeColors[index].value,
    };
  }),
);

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
      <!-- 一级分类做成卡片：图标底色取配置里的彩虹色，两类各一种色、不做统一 -->
      <nav class="flex flex-wrap gap-3">
        <button
          v-for="top in topCategoryCards"
          :key="top.key"
          type="button"
          class="flex cursor-pointer items-center gap-3 rounded-2xl border bg-sf-primary px-3 py-3 transition-colors"
          :class="
            currentTopCategory === top.key ? 'border-sf-theme' : 'border-sf-b hover:border-sf-theme'
          "
          @click="selectTopCategory(top.key)"
        >
          <span
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            :style="{ background: top.tileColor, color: top.iconColor }"
          >
            <SfIcon :icon="top.icon" size="6" />
          </span>
          <span class="flex flex-col items-start">
            <span
              class="text-2xl font-black"
              :class="currentTopCategory === top.key ? 'text-sf-theme' : 'text-sf-text'"
            >
              {{ top.count }}
            </span>
            <span class="mt-1 text-sm text-sf-text-2">
              {{ $t(`resumeTemplateTopCategory_${top.key}`) }}
            </span>
          </span>
        </button>
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
    <!-- 二级维度用下划线页签：下划线只出现在这一层，专门标识当前选中的维度；
         该维度只有一个时不再重复展示，直接展示它的选项 -->
    <div
      v-if="currentCategories.length > 1"
      class="mt-3 flex flex-wrap items-center gap-6 border-b border-sf-b"
    >
      <button
        v-for="category in currentCategories"
        :key="category.key"
        type="button"
        class="-mb-px cursor-pointer border-b-2 pb-3 text-sm transition-colors"
        :class="
          currentCategoryKey === category.key
            ? 'border-sf-theme font-bold text-sf-theme'
            : 'border-transparent text-sf-text-2 hover:text-sf-theme'
        "
        @click="selectCategory(category.key)"
      >
        {{ $t(`resumeTemplateCategory_${category.key}`) }}
      </button>
    </div>
    <!-- 选项只用文字：下划线留给二级维度页签，这里选中只变主题色并加粗 -->
    <div class="mt-3 flex flex-wrap gap-6">
      <button
        v-for="option in currentOptions"
        :key="option.key"
        class="cursor-pointer text-sm transition-colors"
        :class="
          selectedOptionKey === option.key
            ? 'font-bold text-sf-theme'
            : 'text-sf-text-2 hover:text-sf-theme'
        "
        type="button"
        @click="toggleOption(option.key)"
      >
        {{ $t(`resumeTemplateOption_${currentCategory.key}_${option.key}`) }}
      </button>
    </div>
  </section>
</template>
