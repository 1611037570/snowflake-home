<script setup>
import { computed, nextTick, ref, watch } from "vue";
import { resumeTemplateIndustryOptions, resumeTemplateWorkExperienceOptions } from "@/views/resume/template/data/list";
import i18n from "@/locales";

defineOptions({ name: "TemplateExamplePicker" });

const props = defineProps({
  examples: { type: Array, default: () => [] },
  kind: { type: String, required: true },
  recommendedHot: { type: Boolean, default: false },
  searchTerm: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["search", "select"]);

const dropdownRef = ref();
const scrollbarRef = ref();
const query = ref("");
const visibleCount = ref(5);
const selectedExperience = ref("all");
const selectedIndustry = ref("all");
const isLoadingMore = ref(false);

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
  return props.examples.filter((example) => {
    const matchesExperience =
      selectedExperience.value === "all" || example.experiences.includes(selectedExperience.value);
    const matchesIndustry =
      selectedIndustry.value === "all" ||
      example.industries.includes(selectedIndustry.value) ||
      example.industries.includes("all");
    return matchesExperience && matchesIndustry;
  });
});

const visibleExamples = computed(() => filteredExamples.value.slice(0, visibleCount.value));
const hasMore = computed(() => visibleCount.value < filteredExamples.value.length);

// 搜索框输入始终按岗位标记匹配，不检索范例正文。
watch(
  query,
  (value) => {
    visibleCount.value = 5;
    emit("search", value);
  },
  { flush: "sync" },
);

const loadNextBatch = () => {
  // 滚动到底部时追加五条，短列表则自动补足滚动区域。
  if (!hasMore.value || isLoadingMore.value) return;
  const wrap = scrollbarRef.value?.wrapRef;
  if (!wrap || wrap.scrollTop + wrap.clientHeight < wrap.scrollHeight - 24) return;

  isLoadingMore.value = true;
  visibleCount.value += 5;
  nextTick(() => {
    isLoadingMore.value = false;
    loadNextBatch();
  });
};

watch(
  filteredExamples,
  async () => {
    visibleCount.value = 5;
    await nextTick();
    loadNextBatch();
  },
);

const openExamples = () => {
  const queryChanged = query.value !== props.searchTerm;
  query.value = props.searchTerm;
  if (!queryChanged) emit("search", query.value);
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
          <div v-if="recommendedHot" class="px-1.5 text-xs text-sf-text-3">
            {{ $t("resumeExampleHotRecommendation") }}
          </div>
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
        <SfScrollbar ref="scrollbarRef" height="220px" class="w-full" @scroll="loadNextBatch">
          <div v-if="loading" class="py-3 text-center text-xs text-sf-text-3">
            <span
              class="mx-auto mb-3 block h-4 w-4 animate-spin rounded-full border-2 border-sf-b border-t-sf-theme"
            ></span>
            {{ $t("resumeExampleLoading") }}
          </div>
          <div v-else-if="!filteredExamples.length" class="py-3 text-center text-xs text-sf-text-3">
            {{ $t("resumeExampleEmpty") }}
          </div>
          <div v-else class="flex flex-col gap-1.5">
            <button
              v-for="example in visibleExamples"
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
            <div v-if="hasMore || isLoadingMore" class="py-3 text-center text-xs text-sf-text-3">
              <span
                v-if="isLoadingMore"
                class="mx-auto mb-3 block h-4 w-4 animate-spin rounded-full border-2 border-sf-b border-t-sf-theme"
              ></span>
              <span v-else>{{ $t("resumeExampleLoadMore") }}</span>
            </div>
            <div v-else class="py-3 text-center text-xs text-sf-text-3">
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
