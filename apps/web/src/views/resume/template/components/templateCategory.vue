<script setup>
import { resumeTemplateCategoryGroups } from "../data";
import { computed, ref } from "vue";

const currentCategory = ref("scene");
const selectedCategoryOptions = ref({});
const currentCategoryGroup = computed(
  () =>
    resumeTemplateCategoryGroups.find((group) => group.key === currentCategory.value) ||
    resumeTemplateCategoryGroups[0],
);
const currentCategoryOptions = computed(() => currentCategoryGroup.value.options);
const selectCategory = (key) => {
  currentCategory.value = key;
};
const isCategoryOptionSelected = (groupKey, optionKey) =>
  selectedCategoryOptions.value[groupKey] === optionKey;
const toggleCategoryOption = (groupKey, optionKey) => {
  selectedCategoryOptions.value = {
    ...selectedCategoryOptions.value,
    [groupKey]: isCategoryOptionSelected(groupKey, optionKey) ? undefined : optionKey,
  };
};
</script>

<template>
  <section class="mb-3">
    <nav class="flex flex-wrap gap-3">
      <SfButton
        v-for="group in resumeTemplateCategoryGroups"
        :key="group.key"
        :plain="currentCategory !== group.key"
        :round="false"
        @click="selectCategory(group.key)"
      >
        <span class="flex items-center gap-3">
          <SfIcon :icon="group.icon" size="5" />
          {{ group.name }}
        </span>
      </SfButton>
    </nav>
    <div class="mt-3 flex flex-wrap gap-3">
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
