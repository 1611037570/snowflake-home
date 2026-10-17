<script setup>
import { computed, ref } from "vue";
import WangEditor from "@/components/business/wangEditor";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import TemplateExamplePicker from "./templateExamplePicker.vue";
import AiResultPanel from "./aiResultPanel.vue";
import { loadResumeExamples } from "@/views/resume/template/data/resumeExamples";
import { useFormContext } from "@/components/business/dynamicForm/api";
import { useResumeContentAi } from "./useResumeContentAi";

defineOptions({ name: "ResumeContentEditor" });

// 只有工作经历、教育经历、项目经历与专业技能提供模板范例，其余正文使用不带范例入口的普通编辑器。
const TEMPLATE_EXAMPLE_KINDS = ["work", "education", "project", "skill"];

const content = defineModel("modelValue", {
  type: String,
  default: "",
});
const props = defineProps({
  kind: { type: String, default: "work" },
});
const { getFieldDataKey } = useFormContext();
// 使用表单公开路径定位当前字段，重复正文不会影响记录定位
const {
  loading: aiLoading,
  candidates: aiCandidates,
  activeIndex: aiActiveIndex,
  activeAction: aiAction,
  runAiContent,
  applyResult: applyAiResult,
  discardResult: discardAiResult,
  setActiveIndex: setAiActiveIndex,
} = useResumeContentAi(
  content,
  () =>
    getFieldDataKey({
      // 普通输入字段
      type: "object",
      // 当前富文本编辑组件
      component: "resumeContentEditor",
      // 当前容器内的正文数据绑定
      model: {
        // 正文字段路径
        source: ["data", "content"],
        // 编辑组件的双向绑定属性
        prop: "modelValue",
      },
    }),
  // 字段类型：决定正文写法与篇幅
  () => props.kind,
);
// 生成中或已有候选时展示结果卡片
const aiVisible = computed(() => aiLoading.value || aiCandidates.value.length > 0);
// 本次生成的候选数量，一次请求多份供挑选
const aiCount = ref(1);
// 数量选项
const aiCountOptions = [1, 2, 3];

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);
// 所有范例都按个人信息中的求职岗位匹配，避免使用经历自身的岗位或项目名称。
const targetPosition = computed(() => currentData.value?.user?.data?.position ?? "");
const examples = ref([]);
const recommendedHot = ref(false);
const isLoading = ref(false);
// 当前字段是否属于提供模板范例的四类正文。
const supportsTemplateExample = computed(() => TEMPLATE_EXAMPLE_KINDS.includes(props.kind));
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
    <!-- 论文研究内容直接使用一行起步的多行文本框保存纯文本。 -->
    <SfInput
      v-if="props.kind === 'publication'"
      v-model="content"
      type="textarea"
      :autosize="{ minRows: 1, maxRows: 4 }"
      class="[&_.el-textarea__inner]:text-[10px]"
    />
    <WangEditor v-else v-model="content">
      <template v-if="supportsTemplateExample" #toolbar>
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
        <div class="flex flex-wrap items-center gap-3 border-t border-sf-b bg-sf-module-header px-3 py-1 text-sf-text">
          <span class="shrink-0 text-xs font-semibold">✦AI+</span>
          <div class="flex flex-wrap items-center gap-3">
            <button
              v-for="(action, index) in [
                $t('resumeContentGenerate'),
                $t('resumeContentPolish'),
                $t('resumeContentSimplify'),
              ]"
              :key="action"
              type="button"
              class="inline-flex h-6 cursor-pointer items-center rounded-3xl bg-sf-primary px-3 text-xs font-medium text-sf-text transition-colors hover:bg-sf-page"
              :disabled="aiLoading"
              @click="runAiContent(['generate', 'polish', 'simplify'][index], aiCount)"
            >
              {{ action }}
            </button>
          </div>
        </div>
        <!-- 数量单独一行：一次请求产出多份候选供挑选 -->
        <div
          class="flex items-center gap-3 bg-sf-module-header px-3 py-1"
          :class="aiVisible ? '' : 'rounded-b-3xl'"
        >
          <span class="text-xs text-sf-text-3">数量</span>
          <div class="inline-flex items-center rounded-full border border-sf-b bg-sf-primary p-[2px]">
            <button
              v-for="option in aiCountOptions"
              :key="option"
              type="button"
              class="inline-flex h-5 w-8 cursor-pointer items-center justify-center rounded-full text-xs transition-colors"
              :class="option === aiCount ? 'bg-sf-base text-sf-primary' : 'text-sf-text-2 hover:text-sf-text'"
              @click="aiCount = option"
            >
              {{ option }}
            </button>
          </div>
        </div>
        <!-- 生成结果先在此确认，采用后才写入编辑器 -->
        <AiResultPanel
          v-if="aiVisible"
          class="rounded-b-2xl"
          :action="aiAction"
          :loading="aiLoading"
          :candidates="aiCandidates"
          :active-index="aiActiveIndex"
          @apply="applyAiResult"
          @regenerate="runAiContent(aiAction, aiCount)"
          @discard="discardAiResult"
          @select="setAiActiveIndex"
        />
      </template>
    </WangEditor>
  </div>
</template>
