<script setup>
import { computed, ref } from "vue";
import WangEditor from "@/components/business/wangEditor";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import TemplateExamplePicker from "./templateExamplePicker.vue";
import { loadResumeExamples } from "@/views/resume/template/data/resumeExamples";
import { useResumeAiAvailability } from "@/views/resume/hooks/useResumeAiAvailability";

defineOptions({ name: "ResumeContentEditor" });

const content = defineModel("modelValue", {
  type: String,
  default: "",
});
const props = defineProps({
  kind: { type: String, default: "work" },
});
const { ensureAiAvailable } = useResumeAiAvailability();

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);
// 所有范例都按个人信息中的求职岗位匹配，避免使用经历自身的岗位或项目名称。
const targetPosition = computed(() => currentData.value?.user?.data?.position ?? "");
const examples = ref([]);
const recommendedHot = ref(false);
const isLoading = ref(false);
// 连续输入时只采用最后一次岗位匹配结果。
let latestRequestId = 0;

const loadExamples = async (position) => {
  const requestId = ++latestRequestId;
  isLoading.value = true;
  // 新搜索开始时清除上一轮的热门推荐提示。
  recommendedHot.value = false;
  try {
    const result = await loadResumeExamples(props.kind, String(position ?? ""));
    if (requestId === latestRequestId) {
      examples.value = result.examples;
      recommendedHot.value = result.recommendedHot;
    }
  } finally {
    if (requestId === latestRequestId) isLoading.value = false;
  }
};

const appendExample = (example) => {
  // 选择范例时保留当前编辑内容，并追加对应字段的富文本。
  const currentContent = String(content.value ?? "").trim();
  content.value = `${currentContent}${example.content}`;
};
</script>

<template>
  <div class="w-full">
    <WangEditor v-model="content">
      <template #toolbar>
        <TemplateExamplePicker
          :examples="examples"
          :kind="props.kind"
          :recommended-hot="recommendedHot"
          :search-term="targetPosition"
          :loading="isLoading"
          @search="loadExamples"
          @select="appendExample"
        />
      </template>
      <template #bottom>
        <div
          class="flex flex-wrap items-center gap-3 rounded-b-2xl bg-sf-theme px-3 py-1 text-sf-theme-text"
        >
          <span class="shrink-0 font-semibold">✦AI+</span>
          <div class="flex flex-wrap items-center gap-3">
            <button
              v-for="action in [$t('resumeContentGenerate'), $t('resumeContentPolish'), $t('resumeContentSimplify')]"
              :key="action"
              type="button"
              class="cursor-pointer rounded-3xl bg-sf-primary px-3 py-1 text-sm font-medium text-sf-text transition-colors hover:bg-sf-page"
              @click="ensureAiAvailable()"
            >
              {{ action }}
            </button>
          </div>
        </div>
      </template>
    </WangEditor>
  </div>
</template>
