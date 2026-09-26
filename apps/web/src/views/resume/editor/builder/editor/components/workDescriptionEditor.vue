<script setup>
import { computed, ref } from "vue";
import WangEditor from "@/components/business/wangEditor";
import { resumeTemplateWorkExperienceOptions } from "@/views/resume/template/data/list";
import { loadResumeTemplates } from "@/views/resume/template/data/resumeData";
import i18n from "@/locales";

defineOptions({ name: "WorkDescriptionEditor" });

const content = defineModel("modelValue", {
  type: String,
  default: "",
});
const props = defineProps({
  position: { type: String, default: "" },
});

const positionQuery = ref("");
const selectedExperience = ref("all");
const selectedIndustry = ref("all");
const examples = ref([]);
const isLoading = ref(false);
const dropdownRef = ref();

const experienceOptions = computed(() => {
  i18n.global.locale.value;
  return [
    { value: "all", name: i18n.global.t("workExampleAllExperiences") },
    ...resumeTemplateWorkExperienceOptions.map((option) => ({
      value: option.key,
      name: i18n.global.t(`workExampleExperience_${option.key}`),
    })),
  ];
});

const industryOptions = computed(() => {
  i18n.global.locale.value;
  const industryKeys = [...new Set(examples.value.flatMap((example) => example.industries))];
  return [
    { value: "all", name: i18n.global.t("workExampleAllIndustries") },
    ...industryKeys
      .filter((key) => key !== "all")
      .map((key) => ({
        value: key,
        name: i18n.global.t(`workExampleIndustry_${key}`),
      })),
  ];
});

const filteredExamples = computed(() => {
  const query = positionQuery.value.trim().toLocaleLowerCase();
  return examples.value.filter((example) => {
    const matchesPosition =
      !query ||
      example.position.toLocaleLowerCase().includes(query) ||
      query.includes(example.position.toLocaleLowerCase()) ||
      example.text.toLocaleLowerCase().includes(query);
    const matchesExperience =
      selectedExperience.value === "all" || example.experiences.includes(selectedExperience.value);
    const matchesIndustry =
      selectedIndustry.value === "all" ||
      example.industries.includes(selectedIndustry.value) ||
      example.industries.includes("all");
    return matchesPosition && matchesExperience && matchesIndustry;
  });
});

const loadExamples = async () => {
  if (examples.value.length || isLoading.value) return;
  isLoading.value = true;
  try {
    // 从现有简历范本抽取工作经历，避免维护重复的范例内容。
    const templates = await loadResumeTemplates();
    examples.value = templates.flatMap((template) =>
      (template.item.data.work?.list ?? [])
        .map((record) => ({
          position: String(record.data?.post ?? "").trim(),
          content: String(record.data?.content ?? "").trim(),
          text: toPlainText(record.data?.content),
          experiences: template.workExperience ?? [],
          industries: template.industry ?? [],
        }))
        .filter((example) => example.position && example.text),
    );
  } finally {
    isLoading.value = false;
  }
};

const toPlainText = (html) => {
  const element = document.createElement("div");
  element.innerHTML = String(html ?? "");
  return element.textContent?.trim() ?? "";
};

const appendExample = (example) => {
  // 保留用户已有内容，并在末尾追加所选范例。
  const currentContent = String(content.value ?? "").trim();
  content.value = `${currentContent}${example.content}`;
  dropdownRef.value?.handleClose?.();
};

const openExamples = () => {
  positionQuery.value = props.position;
  void loadExamples();
};
</script>

<template>
  <div class="w-full">
    <WangEditor v-model="content">
      <template #toolbar>
        <SfDropdown
          ref="dropdownRef"
          trigger="click"
          placement="bottom-end"
          :show-arrow="false"
          :hide-on-click="false"
          popper-class="work-example-popper"
        >
          <button
            type="button"
            class="mr-3 flex shrink-0 cursor-pointer items-center gap-3 rounded-2xl border border-sf-b bg-sf-bg-2 px-3 py-1.5 text-xs text-sf-text-2 transition-colors hover:border-sf-theme hover:text-sf-theme"
            @click="openExamples"
          >
            {{ $t("workExampleOpen") }}
            <SfIcon icon="mingcute:down-line" size="3" />
          </button>
          <template #dropdown>
            <div
              class="flex w-[420px] max-w-[88vw] flex-col gap-1.5 rounded-3xl border border-sf-b bg-sf-primary py-2"
              @click.stop
            >
              <div class="flex flex-col gap-1.5 px-2">
                <div class="px-1.5 text-xs font-medium text-sf-text">
                  {{ $t("workExampleTitle") }}
                </div>
                <SfInput
                  v-model="positionQuery"
                  clearable
                  class="w-full border border-sf-b bg-sf-bg-2 text-sm"
                  :placeholder="$t('workExamplePositionPlaceholder')"
                  @click.stop
                />
                <div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  <SfSelect
                    v-model="selectedExperience"
                    class="w-full rounded-xl border border-sf-b bg-sf-bg-2 text-sm"
                    :placeholder="$t('workExampleExperience')"
                    :list="experienceOptions"
                    :teleported="false"
                    @click.stop
                  />
                  <SfSelect
                    v-model="selectedIndustry"
                    class="w-full rounded-xl border border-sf-b bg-sf-bg-2 text-sm"
                    :placeholder="$t('workExampleIndustry')"
                    :list="industryOptions"
                    :teleported="false"
                    @click.stop
                  />
                </div>
                <div class="px-1.5 text-xs text-sf-text-3">
                  {{ $t("workExampleCount", { count: filteredExamples.length }) }}
                </div>
              </div>
              <SfScrollbar height="220px" class="w-full">
                <div v-if="isLoading" class="py-3 text-center text-xs text-sf-text-3">
                  {{ $t("workExampleLoading") }}
                </div>
                <div
                  v-else-if="!filteredExamples.length"
                  class="py-3 text-center text-xs text-sf-text-3"
                >
                  {{ $t("workExampleEmpty") }}
                </div>
                <div v-else class="flex flex-col gap-1.5">
                  <button
                    v-for="(example, index) in filteredExamples"
                    :key="`${example.position}-${index}`"
                    type="button"
                    class="w-full cursor-pointer rounded-xl border border-sf-b bg-sf-bg-2 p-1.5 text-left transition-colors hover:border-sf-theme"
                    @click="appendExample(example)"
                  >
                    <span class="mb-1.5 block text-xs font-medium text-sf-text">{{
                      example.position
                    }}</span>
                    <span
                      class="line-clamp-3 block text-xs leading-5 whitespace-pre-line text-sf-text-2"
                      >{{ example.text }}</span
                    >
                  </button>
                  <div class="py-3 text-center text-xs text-sf-text-3">
                    {{ $t("workExampleNoMore") }}
                  </div>
                </div>
              </SfScrollbar>
            </div>
          </template>
        </SfDropdown>
      </template>
    </WangEditor>
  </div>
</template>

<style scoped>
:global(.work-example-popper .el-dropdown-menu) {
  padding: 0;
  border: 0;
  background: transparent !important;
  box-shadow: none;
}
</style>
