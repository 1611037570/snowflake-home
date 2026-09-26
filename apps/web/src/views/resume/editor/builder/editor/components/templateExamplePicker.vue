<script setup>
import { computed, ref } from "vue";
import { resumeTemplateIndustryOptions, resumeTemplateWorkExperienceOptions } from "@/views/resume/template/data/list";
import i18n from "@/locales";

defineOptions({ name: "TemplateExamplePicker" });

const props = defineProps({
  examples: { type: Array, default: () => [] },
  kind: { type: String, required: true },
  searchTerm: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["open", "select"]);

const dropdownRef = ref();
const query = ref("");
const selectedExperience = ref("all");
const selectedIndustry = ref("all");

const getIndustryName = (key) => {
  const translationKey = `resumeExampleIndustry_${key}`;
  const translated = i18n.global.t(translationKey);
  if (translated !== translationKey) return translated;
  return resumeTemplateIndustryOptions.find((option) => option.key === key)?.value ?? key;
};

const experienceOptions = computed(() => {
  i18n.global.locale.value;
  return [
    { value: "all", name: i18n.global.t("resumeExampleAllExperiences") },
    ...resumeTemplateWorkExperienceOptions.map((option) => ({
      value: option.key,
      name: i18n.global.t(`resumeExampleExperience_${option.key}`),
    })),
  ];
});

const industryOptions = computed(() => {
  i18n.global.locale.value;
  const industryKeys = [...new Set(props.examples.flatMap((example) => example.industries))];
  return [
    { value: "all", name: i18n.global.t("resumeExampleAllIndustries") },
    ...industryKeys
      .filter((key) => key !== "all")
      .map((key) => ({
        value: key,
        name: getIndustryName(key),
      })),
  ];
});

const title = computed(() => {
  i18n.global.locale.value;
  return i18n.global.t(`resumeExampleTitle_${props.kind}`);
});

const placeholder = computed(() => {
  i18n.global.locale.value;
  return i18n.global.t("resumeExampleSearchPlaceholder");
});

const filteredExamples = computed(() => {
  const search = query.value.trim().toLocaleLowerCase();
  return props.examples.filter((example) => {
    const matchesSearch = !search || example.searchText.includes(search);
    const matchesTitle = search && search.includes(example.title.toLocaleLowerCase());
    const matchesExperience =
      selectedExperience.value === "all" || example.experiences.includes(selectedExperience.value);
    const matchesIndustry =
      selectedIndustry.value === "all" ||
      example.industries.includes(selectedIndustry.value) ||
      example.industries.includes("all");
    return (matchesSearch || matchesTitle) && matchesExperience && matchesIndustry;
  });
});

const openExamples = () => {
  query.value = props.searchTerm;
  emit("open");
};

const selectExample = (example) => {
  emit("select", example);
  dropdownRef.value?.handleClose?.();
};
</script>

<template>
  <SfDropdown
    ref="dropdownRef"
    trigger="click"
    placement="bottom-end"
    :show-arrow="false"
    :hide-on-click="false"
    popper-class="resume-example-popper"
  >
    <button
      type="button"
      class="mr-3 flex shrink-0 cursor-pointer items-center gap-3 rounded-2xl border border-sf-b bg-sf-bg-2 px-3 py-1.5 text-xs text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
      @click="openExamples"
    >
      {{ $t("resumeExampleOpen") }}
      <SfIcon icon="mingcute:down-line" size="3" />
    </button>
    <template #dropdown>
      <div
        class="flex w-[420px] max-w-[88vw] flex-col gap-1.5 rounded-3xl border border-sf-b bg-sf-primary py-2"
        @click.stop
      >
        <div class="flex flex-col gap-1.5 px-2">
          <div class="px-1.5 text-xs font-medium text-sf-text">{{ title }}</div>
          <SfInput
            v-model="query"
            clearable
            class="w-full border border-sf-b bg-sf-bg-2 text-sm"
            :placeholder="placeholder"
            @click.stop
          />
          <div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <SfSelect
              v-model="selectedExperience"
              class="w-full rounded-xl border border-sf-b bg-sf-bg-2 text-sm"
              :placeholder="$t('resumeExampleExperience')"
              :list="experienceOptions"
              :teleported="false"
              @click.stop
            />
            <SfSelect
              v-model="selectedIndustry"
              class="w-full rounded-xl border border-sf-b bg-sf-bg-2 text-sm"
              :placeholder="$t('resumeExampleIndustry')"
              :list="industryOptions"
              :teleported="false"
              @click.stop
            />
          </div>
          <div class="px-1.5 text-xs text-sf-text-3">
            {{ $t("resumeExampleCount", { count: filteredExamples.length }) }}
          </div>
        </div>
        <SfScrollbar height="220px" class="w-full">
          <div v-if="loading" class="py-3 text-center text-xs text-sf-text-3">
            {{ $t("resumeExampleLoading") }}
          </div>
          <div v-else-if="!filteredExamples.length" class="py-3 text-center text-xs text-sf-text-3">
            {{ $t("resumeExampleEmpty") }}
          </div>
          <div v-else class="flex flex-col gap-1.5">
            <button
              v-for="example in filteredExamples"
              :key="example.id"
              type="button"
              class="w-full cursor-pointer rounded-xl border border-sf-b bg-sf-bg-2 p-1.5 text-left transition-colors hover:border-sf-theme"
              @click="selectExample(example)"
            >
              <span class="mb-1.5 block text-xs font-medium text-sf-text">{{ example.title }}</span>
              <span v-if="example.subtitle" class="mb-1.5 block text-xs text-sf-text-3">
                {{ example.subtitle }}
              </span>
              <span class="line-clamp-3 block text-xs leading-5 whitespace-pre-line text-sf-text-2">
                {{ example.text }}
              </span>
            </button>
            <div class="py-3 text-center text-xs text-sf-text-3">
              {{ $t("resumeExampleNoMore") }}
            </div>
          </div>
        </SfScrollbar>
      </div>
    </template>
  </SfDropdown>
</template>

<style scoped>
:global(.resume-example-popper .el-dropdown-menu) {
  padding: 0;
  border: 0;
  background: transparent !important;
  box-shadow: none;
}
</style>
