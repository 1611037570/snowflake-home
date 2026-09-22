<script setup>
import { resumeTemplateCategoryGroups } from "../data";
import { computed, ref } from "vue";

const emit = defineEmits(["change", "category-change", "size-change"]);
const currentCategory = ref("scene");
const selectedCategoryOptions = ref({});
const previewSize = ref("default");
const currentCategoryGroup = computed(
  () =>
    resumeTemplateCategoryGroups.find((group) => group.key === currentCategory.value) ||
    resumeTemplateCategoryGroups[0],
);
const currentCategoryOptions = computed(() => currentCategoryGroup.value.options);
const selectCategory = (key) => {
  currentCategory.value = key;
  emit("category-change", key);
};
const selectPreviewSize = (size) => {
  previewSize.value = size;
  emit("size-change", size);
};
const isCategoryOptionSelected = (groupKey, optionKey) =>
  selectedCategoryOptions.value[groupKey] === optionKey;
const toggleCategoryOption = (groupKey, optionKey) => {
  selectedCategoryOptions.value = {
    ...selectedCategoryOptions.value,
    [groupKey]: isCategoryOptionSelected(groupKey, optionKey) ? undefined : optionKey,
  };
  emit("change", selectedCategoryOptions.value);
};
</script>

<template>
  <section class="mb-3">
    <div class="flex items-center justify-between gap-3">
      <nav class="flex flex-wrap gap-3">
        <SfButton
          v-for="group in resumeTemplateCategoryGroups"
          :key="group.key"
          :plain="currentCategory !== group.key"
          :round="true"
          :icon="group.icon"
          @click="selectCategory(group.key)"
        >
          {{ group.name }}
        </SfButton>
      </nav>
      <div class="flex shrink-0 items-center gap-3">
        <span class="text-sm font-bold text-sf-text-2">预览尺寸</span>
        <SfButton
          :plain="previewSize !== 'default'"
          :round="true"
          @click="selectPreviewSize('default')"
        >
          小图
        </SfButton>
        <SfButton
          :plain="previewSize !== 'small'"
          :round="true"
          @click="selectPreviewSize('small')"
        >
          大图
        </SfButton>
      </div>
    </div>
    <div v-if="currentCategoryOptions.length" class="mt-3 flex flex-wrap gap-3">
      <button
        v-for="option in currentCategoryOptions"
        :key="option.key"
        class="h-9 cursor-pointer text-sm leading-9 text-sf-text-2 transition-colors hover:text-sf-theme"
        :class="{
          'font-bold text-sf-theme': isCategoryOptionSelected(currentCategoryGroup.key, option.key),
        }"
        type="button"
        @click="toggleCategoryOption(currentCategoryGroup.key, option.key)"
      >
        {{ option.value }}
      </button>
    </div>
  </section>
</template>
