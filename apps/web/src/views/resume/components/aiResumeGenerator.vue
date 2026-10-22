<script setup lang="ts">
import { useAiStore, useResumeStore } from "@/stores";
import { $t } from "@/locales";
import { useResumeAiAvailability } from "@/views/resume/hooks/useResumeAiAvailability";
import { normalizeResumeData } from "@/views/resume/mine/resumeImportNormalizer";
import ThumbPreview from "@/views/resume/editor/preview/modes/thumb.vue";
import {
  runInitialResumeGeneration,
  type InitialResumeGenerationInput,
  type InitialResumeGenerationStage,
} from "@snowflake/resume-agent";
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";

defineOptions({ name: "AiResumeGenerator" });

type GenerationStep = {
  // 对应简历数据中的稳定模块标识。
  key: keyof InitialResumeGenerationInput;
  // 当前步骤展示标题。
  title: string;
  // 当前步骤填写说明。
  description: string;
  // 输入框占位提示。
  placeholder: string;
  // 当前步骤展示图标。
  icon: string;
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
const generationStage = ref<InitialResumeGenerationStage>("analyzing");
const currentIndex = ref(0);
const sourceItem = ref<Record<string, any> | null>(null);
const pendingItem = ref<Record<string, any> | null>(null);
const controller = ref<AbortController | null>(null);
const sections = reactive<InitialResumeGenerationInput>({});

const steps = computed<GenerationStep[]>(() => [
  {
    key: "user",
    title: $t("resumeAiGenerateUserTitle"),
    description: $t("resumeAiGenerateUserDescription"),
    placeholder: $t("resumeAiGenerateUserPlaceholder"),
    icon: "lucide:user-round",
  },
  {
    key: "education",
    title: $t("resumeAiGenerateEducationTitle"),
    description: $t("resumeAiGenerateEducationDescription"),
    placeholder: $t("resumeAiGenerateEducationPlaceholder"),
    icon: "lucide:graduation-cap",
  },
  {
    key: "skill",
    title: $t("resumeAiGenerateSkillTitle"),
    description: $t("resumeAiGenerateSkillDescription"),
    placeholder: $t("resumeAiGenerateSkillPlaceholder"),
    icon: "lucide:badge-check",
  },
  {
    key: "work",
    title: $t("resumeAiGenerateWorkTitle"),
    description: $t("resumeAiGenerateWorkDescription"),
    placeholder: $t("resumeAiGenerateWorkPlaceholder"),
    icon: "lucide:briefcase-business",
  },
  {
    key: "project",
    title: $t("resumeAiGenerateProjectTitle"),
    description: $t("resumeAiGenerateProjectDescription"),
    placeholder: $t("resumeAiGenerateProjectPlaceholder"),
    icon: "lucide:folder-kanban",
  },
]);

const currentStep = computed(() => steps.value[currentIndex.value]!);
const isLastStep = computed(() => currentIndex.value === steps.value.length - 1);
const modalWidth = computed(() => pendingItem.value ? "min(90vw, 1200px)" : "min(90vw, 720px)");
const generationStatus = computed(() => $t(`resumeAiGenerateStage_${generationStage.value}`));
const currentContent = computed({
  get: () => sections[currentStep.value.key] || "",
  set: (value: string) => {
    sections[currentStep.value.key] = value;
  },
});

// 列表页没有编辑器内模型弹窗，缺少模型时前往统一配置页。
const configureModel = () => {
  aiStore.modelManagerTab = "added";
  router.push("/resume/ai");
};

// 每次打开都清理旧填写，并允许入口预填已经收集的个人信息。
const open = (
  item: Record<string, any>,
  initialSections: InitialResumeGenerationInput = {},
) => {
  if (resumeStore.resumeList.length >= resumeStore.maxCount) {
    ElMessage.warning($t("resumeCreateMaxLimit", { max: resumeStore.maxCount }));
    return;
  }
  if (!ensureAiAvailable(configureModel)) return;
  Object.keys(sections).forEach((key) => delete sections[key as keyof InitialResumeGenerationInput]);
  Object.assign(sections, initialSections);
  sourceItem.value = JSON.parse(JSON.stringify(item || {}));
  pendingItem.value = null;
  currentIndex.value = 0;
  visible.value = true;
};

// 下一步只接受当前模块的有效内容，空模块通过明确的跳过操作推进。
const goNext = () => {
  if (!currentContent.value.trim()) {
    ElMessage.warning($t("resumeAiGenerateFillOrSkip"));
    return;
  }
  if (isLastStep.value) {
    void generate();
    return;
  }
  currentIndex.value += 1;
};

const goBack = () => {
  if (currentIndex.value > 0) currentIndex.value -= 1;
};

// 跳过后不向模型发送该模块；最后一步跳过时直接生成已填写模块。
const skipCurrent = () => {
  const key = currentStep.value.key;
  delete sections[key];
  if (isLastStep.value) {
    void generate();
    return;
  }
  currentIndex.value += 1;
};

// AI 只生成业务数据，模板主题与布局继续沿用入口传入的数据。
const generate = async () => {
  const input = Object.fromEntries(
    Object.entries(sections).filter(([, value]) => typeof value === "string" && value.trim()),
  ) as InitialResumeGenerationInput;
  if (!Object.keys(input).length) {
    ElMessage.warning($t("resumeAiGenerateNeedOneModule"));
    return;
  }
  controller.value?.abort();
  const requestController = new AbortController();
  controller.value = requestController;
  generationStage.value = "analyzing";
  generating.value = true;
  try {
    const result = await runInitialResumeGeneration(input, {
      signal: requestController.signal,
      onStage: (stage) => {
        generationStage.value = stage;
      },
    });
    if (requestController.signal.aborted || controller.value !== requestController) return;
    const generated = normalizeResumeData(result);
    const requestedKeys = new Set(Object.keys(input));
    // 即使模型额外返回模块，也只保留用户实际填写的范围，确保跳过操作生效。
    const generatedData = Object.fromEntries(
      Object.entries(generated.data).filter(([key]) => requestedKeys.has(key)),
    );
    const generatedModules = generated.config.modules.filter((module: { key?: string }) =>
      module.key ? requestedKeys.has(module.key) : false,
    );
    const source = JSON.parse(JSON.stringify(sourceItem.value || {}));
    pendingItem.value = {
      ...source,
      data: generatedData,
      config: {
        ...(source.config || {}),
        modules: generatedModules,
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

// 返回采集步骤保留用户原始输入，方便调整后再次生成。
const editSections = () => {
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
        </div>
        <div class="mt-auto flex flex-col gap-3">
          <SfButton size="large" icon="lucide:check" :disabled="generating" @click="confirmGenerated">
            {{ $t("resumeAiGenerateUseResult") }}
          </SfButton>
          <SfButton size="large" plain icon="lucide:refresh-cw" :disabled="generating" @click="generate">
            {{ generating ? $t("resumeAiGenerating") : $t("resumeAiGenerateAgain") }}
          </SfButton>
          <SfButton size="large" type="bg" :disabled="generating" @click="editSections">
            {{ $t("resumeAiGenerateBackToEdit") }}
          </SfButton>
        </div>
      </aside>
    </div>
    <div v-else class="flex max-h-[72vh] min-h-[480px] flex-col gap-6">
      <div class="grid grid-cols-5 gap-3">
        <button
          v-for="(step, index) in steps"
          :key="step.key"
          type="button"
          class="flex min-w-0 flex-col items-center gap-3 rounded-xl border px-3 py-3 transition-colors"
          :class="index === currentIndex ? 'border-sf-theme bg-sf-theme-3 text-sf-theme' : 'border-sf-b text-sf-text-3'"
          :disabled="generating"
          @click="currentIndex = index"
        >
          <SfIcon :icon="step.icon" size="5" />
          <span class="w-full truncate text-xs">{{ step.title }}</span>
        </button>
      </div>

      <div class="flex min-h-0 flex-1 flex-col gap-3">
        <div class="flex items-center gap-3">
          <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sf-theme-3 text-sf-theme">
            <SfIcon :icon="currentStep.icon" size="6" />
          </span>
          <div class="min-w-0">
            <h3 class="text-lg font-black text-sf-text">{{ currentStep.title }}</h3>
            <p class="mt-3 text-sm text-sf-text-2">{{ currentStep.description }}</p>
          </div>
        </div>
        <SfInput
          v-model="currentContent"
          type="textarea"
          :rows="10"
          resize="none"
          :disabled="generating"
          :placeholder="currentStep.placeholder"
          class="min-h-0 flex-1 border border-sf-b bg-sf-bg"
        />
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <SfButton plain :disabled="generating" @click="skipCurrent">
          {{ isLastStep ? $t("resumeAiGenerateSkipAndGenerate") : $t("resumeAiGenerateSkipModule") }}
        </SfButton>
        <div class="flex items-center gap-3">
          <SfButton v-if="currentIndex > 0" type="bg" :disabled="generating" @click="goBack">
            {{ $t("resumeAiGeneratePrevious") }}
          </SfButton>
          <SfButton
            :disabled="generating"
            :icon="isLastStep ? 'lucide:wand-sparkles' : ''"
            @click="goNext"
          >
            {{ generating
              ? $t("resumeAiGenerating")
              : isLastStep
                ? $t("resumeAiGenerateAction")
                : $t("resumeAiGenerateNext") }}
          </SfButton>
        </div>
      </div>
    </div>
  </SfModal>
</template>
