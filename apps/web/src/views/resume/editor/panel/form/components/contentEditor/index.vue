<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { useIntersectionObserver } from "@vueuse/core";
import SfSkeleton from "@/components/el/skeleton";
import WangEditor from "@/components/business/wangEditor";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import TemplateExamplePicker from "./templateExamplePicker.vue";
import AiResultPanel from "./aiResultPanel.vue";
import { loadResumeExamples } from "@/views/resume/template/data/resumeExamples";
import { useFormContext, useFormReadyTask } from "@/components/business/dynamicForm/api";
import { useResumeContentAi } from "./useResumeContentAi";

defineOptions({ name: "ResumeContentEditor" });

const editorHost = ref(null);
const scrollRoot = ref(null);
const editorMounted = ref(false);
const editorReady = ref(false);
// 首次可见性判定完成后，屏幕外正文不再阻塞表单就绪。
const finishVisibility = useFormReadyTask();
let afterNavigation;
const activateEditor = async () => {
  editorMounted.value = true;
  stop();
  // 先让富文本登记自身的创建任务，再结束可见性等待。
  await nextTick();
  finishVisibility();
};
const { isSupported, resume, stop } = useIntersectionObserver(
  editorHost,
  ([entry]) => {
    if (!entry) return;
    if (entry.isIntersecting) void activateEditor();
    else finishVisibility();
  },
  {
    root: scrollRoot, // 使用左侧表单滚动容器判断可见范围。
    rootMargin: "180px 0px", // 提前创建邻近正文，减少滚动到达时的等待。
    immediate: false, // 挂载后找到真实滚动容器再开始观察。
  },
);
onMounted(() => {
  scrollRoot.value = editorHost.value?.closest(".el-scrollbar__wrap") ?? null;
  if (isSupported.value) resume();
  else void activateEditor();
});
// 导航可主动创建目标正文，实际就绪后再校正滚动位置。
const activateFromNavigation = (event) => {
  afterNavigation = typeof event.detail === "function" ? event.detail : undefined;
  void activateEditor();
  if (editorReady.value) nextTick(finishNavigation);
};
const finishNavigation = () => {
  editorReady.value = true;
  const callback = afterNavigation;
  afterNavigation = undefined;
  if (callback) nextTick(callback);
};

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
  previewHtml: aiPreviewHtml,
  errorText: aiError,
  activeAction: aiAction,
  runAiContent,
  applyResult: applyAiResult,
  discardResult: discardAiResult,
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
// 生成中、已有预览或出现错误时展示结果卡片
const aiVisible = computed(() => aiLoading.value || !!aiPreviewHtml.value || !!aiError.value);

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
  <div ref="editorHost" class="w-full" data-resume-content @resume-content-activate="activateFromNavigation">
    <SfSkeleton v-if="!editorMounted" class="min-h-54" />
    <WangEditor v-else v-model="content" @ready="finishNavigation">
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
          class="flex flex-wrap items-center gap-3 bg-sf-theme px-3 py-1 text-sf-theme-text"
          :class="aiVisible ? '' : 'rounded-b-2xl'"
        >
          <span class="shrink-0 font-semibold">✦AI+</span>
          <div class="flex flex-wrap items-center gap-3">
            <button
              v-for="(action, index) in [$t('resumeContentGenerate'), $t('resumeContentPolish'), $t('resumeContentSimplify')]"
              :key="action"
              type="button"
              class="cursor-pointer rounded-3xl bg-sf-primary px-3 py-1 text-sm font-medium text-sf-text transition-colors hover:bg-sf-page"
              :disabled="aiLoading"
              @click="runAiContent(['generate', 'polish', 'simplify'][index])"
            >
              {{ action }}
            </button>
          </div>
        </div>
        <!-- 生成结果先在此确认，采用后才写入编辑器 -->
        <AiResultPanel
          v-if="aiVisible"
          class="rounded-b-2xl"
          :action="aiAction"
          :loading="aiLoading"
          :preview-html="aiPreviewHtml"
          :error-text="aiError"
          @apply="applyAiResult"
          @regenerate="runAiContent(aiAction)"
          @discard="discardAiResult"
        />
      </template>
    </WangEditor>
  </div>
</template>
