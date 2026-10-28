<script setup lang="ts">
import { useAiStore, useResumeStore } from "@/stores";
import { $t } from "@/locales";
import { useResumeAiAvailability } from "@/views/resume/hooks/useResumeAiAvailability";
import { normalizeResumeData } from "@/views/resume/mine/resumeImportNormalizer";
import { initializeDefaultAddedFields } from "@/stores/modules/resume/hooks/useConfigTemplate";
import ThumbPreview from "@/views/resume/editor/preview/modes/thumb.vue";
import {
  runResumeDraftGeneration,
  type ResumeDraftGenerationStage,
} from "@snowflake/resume-agent";
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";

defineOptions({ name: "AiResumeGenerator" });

type GenerationInput = {
  // 用户填写的求职岗位。
  position: string;
  // 用户填写的工作年限或职业阶段。
  workYears: string;
  // 用户自愿提供的更多真实资料。
  supplement: string;
};

const emit = defineEmits<{
  // 用户确认预览结果后返回已经套用所选模板的简历数据。
  generated: [item: Record<string, any>];
}>();

const router = useRouter();
const aiStore = useAiStore();
const resumeStore = useResumeStore();
const { ensureAiAvailable } = useResumeAiAvailability();
const visible = ref(false);
const generating = ref(false);
const generationStage = ref<ResumeDraftGenerationStage>("analyzing");
const sourceItem = ref<Record<string, any> | null>(null);
const pendingItem = ref<Record<string, any> | null>(null);
const controller = ref<AbortController | null>(null);
const generationInput = reactive<GenerationInput>({
  position: "", // 用户填写的求职岗位。
  workYears: "", // 用户填写的工作年限或职业阶段。
  supplement: "", // 用户自愿提供的更多真实资料。
});
const knownName = ref("");
const generationWarnings = ref<string[]>([]);

const modalWidth = computed(() => pendingItem.value ? "min(90vw, 1200px)" : "min(90vw, 720px)");
const generationStatus = computed(() => $t(`resumeAiGenerateStage_${generationStage.value}`));
// 列表页没有编辑器内模型弹窗，缺少模型时前往统一配置页。
const configureModel = () => {
  aiStore.modelManagerTab = "added";
  router.push("/resume/ai");
};

// 每次打开都清理旧填写，并允许入口预填岗位与补充资料。
const open = (
  item: Record<string, any>,
  initialInput: Partial<GenerationInput> = {},
  initialName = "",
) => {
  if (resumeStore.resumeList.length >= resumeStore.maxCount) {
    ElMessage.warning($t("resumeCreateMaxLimit", { max: resumeStore.maxCount }));
    return;
  }
  if (!ensureAiAvailable(configureModel)) return;
  generationInput.position = initialInput.position?.trim() || "";
  generationInput.workYears = initialInput.workYears?.trim() || "";
  generationInput.supplement = initialInput.supplement?.trim() || "";
  knownName.value = initialName.trim();
  generationWarnings.value = [];
  sourceItem.value = JSON.parse(JSON.stringify(item || {}));
  pendingItem.value = null;
  visible.value = true;
};

// AI 只生成业务数据，模板主题与布局继续沿用入口传入的数据。
const generate = async () => {
  const input: GenerationInput = {
    position: generationInput.position.trim(), // 本次生成采用的目标岗位。
    workYears: generationInput.workYears.trim(), // 本次生成采用的职业阶段。
    supplement: generationInput.supplement.trim(), // 本次生成采用的补充事实。
  };
  if (!input.position || !input.workYears) {
    ElMessage.warning($t("resumeAiGenerateNeedBasics"));
    return;
  }
  controller.value?.abort();
  const requestController = new AbortController();
  controller.value = requestController;
  generationStage.value = "analyzing";
  generationWarnings.value = [];
  generating.value = true;
  try {
    const skillLayout = sourceItem.value?.ui?.skill?.layout === "text" ? "text" : "proficiency";
    // 新建入口只组合通用写作能力所需的资料、目标模块与补充要求。
    const result = await runResumeDraftGeneration({
      brief: `只生成工作经历、项目经历、教育经历和专业技能四个模块，每个模块都要有实际内容。专业技能遵循当前模板的${skillLayout === "text" ? "富文本正文" : "技能列表"}布局；富文本字段使用合法 HTML。`, // 入口只声明生成模块与布局，通用规则由运行时提供。
      facts: `求职岗位：${input.position}\n工作年限：${input.workYears}\n更多补充：${input.supplement || "无"}`, // 用户提供的原始资料只通过读取工具传递。
      requiredModules: ["work", "project", "education", "skill"], // 本入口交由通用能力生成的业务模块。
      skillLayout, // 所选模板当前的专业技能布局。
    }, {
      signal: requestController.signal,
      onStage: (stage) => {
        generationStage.value = stage;
      },
    });
    if (requestController.signal.aborted || controller.value !== requestController) return;
    const generated = normalizeResumeData(result);
    // 个人信息由表单配置初始化推荐字段，姓名与岗位由入口填写，不交给 AI 编造。
    initializeDefaultAddedFields(generated.data);
    const supplementedName = input.supplement.match(/(?:姓名|名字)\s*[：:]\s*([^\s，,。；;]+)/)?.[1];
    generated.data.user ||= { data: {} };
    generated.data.user.data ||= {};
    generated.data.user.data.name = knownName.value || supplementedName || "XX";
    generated.data.user.data.position = input.position;
    generationWarnings.value = generated.warnings;
    // 三项输入驱动整份草稿，保留模型实际生成的全部合法模块。
    const source = JSON.parse(JSON.stringify(sourceItem.value || {}));
    pendingItem.value = {
      ...source,
      data: generated.data,
      config: {
        ...(source.config || {}),
        modules: generated.config.modules,
      },
    };
  } catch (error) {
    if (!requestController.signal.aborted) {
      ElMessage.error(error instanceof Error ? error.message : $t("resumeAiGenerateFailed"));
    }
  } finally {
    if (controller.value === requestController) {
      controller.value = null;
      generating.value = false;
    }
  }
};

// 用户可随时取消当前生成，已填写资料与已有预览结果均保留。
const cancelGeneration = () => {
  controller.value?.abort();
  controller.value = null;
  generating.value = false;
};

// 预览确认后才创建简历并进入编辑器，生成阶段不修改用户数据。
const confirmGenerated = () => {
  if (!pendingItem.value) return;
  emit("generated", pendingItem.value);
  visible.value = false;
};

// 返回输入表单保留用户原始资料，方便调整后再次生成。
const editInput = () => {
  pendingItem.value = null;
};

// 关闭生成器时中止仍在进行的请求，避免迟到结果创建简历。
watch(visible, (value) => {
  if (value) return;
  controller.value?.abort();
  controller.value = null;
  generating.value = false;
  pendingItem.value = null;
});
onBeforeUnmount(() => controller.value?.abort());

defineExpose({ open });
</script>

<template>
  <SfModal v-model="visible" :title="$t('resumeAiGenerateTitle')" :width="modalWidth">
    <!-- ReAct 执行期间展示当前阶段，避免用户误以为入口没有响应。 -->
    <div v-if="generating" class="flex min-h-[480px] flex-col items-center justify-center gap-6 text-center">
      <span class="flex h-18 w-18 items-center justify-center rounded-full bg-sf-theme-3 text-sf-theme">
        <SfIcon icon="lucide:loader-circle" size="9" class="animate-spin" />
      </span>
      <div>
        <h3 class="text-xl font-black text-sf-text">{{ $t("resumeAiGenerateWorkingTitle") }}</h3>
        <p class="mt-3 text-sm text-sf-text-2">{{ generationStatus }}</p>
      </div>
      <SfButton plain @click="cancelGeneration">{{ $t("resumeAiGenerateCancel") }}</SfButton>
    </div>
    <!-- 生成结果先在当前弹窗预览，确认后才交给入口创建简历。 -->
    <div v-else-if="pendingItem" class="flex h-[72vh] min-h-0 flex-col gap-6 md:flex-row">
      <div class="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-sf-b bg-sf-bg">
        <ThumbPreview :item="pendingItem" />
      </div>
      <aside class="flex shrink-0 flex-col gap-6 md:w-[300px]">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-sf-success-2 text-sf-success">
          <SfIcon icon="lucide:file-check-2" size="6" />
        </div>
        <div>
          <h3 class="text-xl font-black text-sf-text">{{ $t("resumeAiGenerateResultTitle") }}</h3>
          <p class="mt-3 text-sm leading-7 text-sf-text-2">
            {{ $t("resumeAiGenerateResultDescription") }}
          </p>
          <p v-if="generationWarnings.length" class="mt-3 text-sm leading-6 text-sf-warning">
            {{ $t("resumeAiGenerateConversionWarnings", { count: generationWarnings.length }) }}
          </p>
          <ul v-if="generationWarnings.length" class="mt-3 max-h-24 list-disc overflow-auto pl-3 text-xs leading-6 text-sf-warning">
            <li v-for="(warning, index) in generationWarnings" :key="index">{{ warning }}</li>
          </ul>
        </div>
        <div class="mt-auto flex flex-col gap-3">
          <SfButton size="large" icon="lucide:check" :disabled="generating" @click="confirmGenerated">
            {{ $t("resumeAiGenerateUseResult") }}
          </SfButton>
          <SfButton size="large" plain icon="lucide:refresh-cw" :disabled="generating" @click="generate">
            {{ generating ? $t("resumeAiGenerating") : $t("resumeAiGenerateAgain") }}
          </SfButton>
          <SfButton size="large" type="bg" :disabled="generating" @click="editInput">
            {{ $t("resumeAiGenerateBackToEdit") }}
          </SfButton>
        </div>
      </aside>
    </div>
    <div v-else class="flex max-h-[72vh] min-h-[480px] flex-col gap-6">
      <p class="text-sm text-sf-text-2">{{ $t("resumeAiGenerateInputDescription") }}</p>
      <label class="flex flex-col gap-3 text-sm text-sf-text">
        <span>{{ $t("resumeAiGeneratePositionTitle") }}</span>
        <SfInput
          v-model="generationInput.position"
          :disabled="generating"
          :placeholder="$t('resumeAiGeneratePositionPlaceholder')"
        />
      </label>
      <label class="flex flex-col gap-3 text-sm text-sf-text">
        <span>{{ $t("resumeAiGenerateWorkYearsTitle") }}</span>
        <SfInput
          v-model="generationInput.workYears"
          :disabled="generating"
          :placeholder="$t('resumeAiGenerateWorkYearsPlaceholder')"
        />
      </label>
      <label class="flex min-h-0 flex-1 flex-col gap-3 text-sm text-sf-text">
        <span>{{ $t("resumeAiGenerateSupplementTitle") }}</span>
        <SfInput
          v-model="generationInput.supplement"
          type="textarea"
          :rows="7"
          resize="none"
          :disabled="generating"
          :placeholder="$t('resumeAiGenerateSupplementPlaceholder')"
          class="min-h-0 flex-1 border border-sf-b bg-sf-bg"
        />
      </label>
      <div class="flex justify-end">
        <SfButton icon="lucide:wand-sparkles" :disabled="generating" @click="generate">
          {{ $t("resumeAiGenerateAction") }}
        </SfButton>
      </div>
    </div>
  </SfModal>
</template>
