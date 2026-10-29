import { useAiStore, useResumeStore } from "@/stores";
import { $t } from "@/locales";
import { useResumeAiAvailability } from "@/views/resume/hooks/useResumeAiAvailability";
import { normalizeResumeData } from "@/views/resume/mine/resumeImportNormalizer";
import { initializeDefaultAddedFields } from "@/stores/modules/resume/hooks/useConfigTemplate";
import {
  runResumeDraftGeneration,
  type ResumeDraftGenerationStage,
} from "@snowflake/resume-agent";
import { ElMessage } from "element-plus";
import { onBeforeUnmount, reactive, ref } from "vue";
import { useRouter } from "vue-router";

/** AI 生成简历的用户输入。 */
export type AiGenerateInput = {
  /** 用户填写的求职岗位。 */
  position: string;
  /** 用户填写的工作年限或职业阶段。 */
  workYears: string;
  /** 用户自愿提供的更多真实资料。 */
  supplement: string;
};

/** 生成前置检查：简历数量上限与模型配置，弹窗入口与独立页面共用同一判断。 */
export const useAiResumeGuard = () => {
  const router = useRouter();
  const aiStore = useAiStore();
  const resumeStore = useResumeStore();
  const { ensureAiAvailable } = useResumeAiAvailability();

  // 列表页与独立页面没有编辑器内模型弹窗，缺少模型时前往统一配置页。
  const configureModel = () => {
    aiStore.modelManagerTab = "added";
    router.push("/resume/ai");
  };

  // 数量或模型未就绪时不进入生成，并给出对应的处理入口。
  const ensureReady = () => {
    if (resumeStore.resumeList.length >= resumeStore.maxCount) {
      ElMessage.warning($t("resumeCreateMaxLimit", { max: resumeStore.maxCount }));
      return false;
    }
    return ensureAiAvailable(configureModel);
  };

  return { ensureReady };
};

/** 通用 AI 生成简历流程：输入、生成、结果预览与取消，不含展示形态。 */
export const useAiResumeDraft = () => {
  const { ensureReady } = useAiResumeGuard();

  const generating = ref(false);
  const generationStage = ref<ResumeDraftGenerationStage>("analyzing");
  const pendingItem = ref<Record<string, any> | null>(null);
  const generationWarnings = ref<string[]>([]);
  const generationInput = reactive<AiGenerateInput>({
    position: "", // 用户填写的求职岗位。
    workYears: "", // 用户填写的工作年限或职业阶段。
    supplement: "", // 用户自愿提供的更多真实资料。
  });
  const sourceItem = ref<Record<string, any> | null>(null);
  const knownName = ref("");
  // 当前请求的取消句柄，用于重生成与离开时中止旧请求。
  let controller: AbortController | null = null;

  // 每次开始新一轮都清理旧填写，并允许入口预填岗位与补充资料。
  const start = (
    item: Record<string, any>,
    initialInput: Partial<AiGenerateInput> = {},
    initialName = "",
  ) => {
    generationInput.position = initialInput.position?.trim() || "";
    generationInput.workYears = initialInput.workYears?.trim() || "";
    generationInput.supplement = initialInput.supplement?.trim() || "";
    knownName.value = initialName.trim();
    generationWarnings.value = [];
    sourceItem.value = JSON.parse(JSON.stringify(item || {}));
    pendingItem.value = null;
  };

  // AI 只生成业务数据，模板主题与布局继续沿用入口传入的数据。
  const generate = async () => {
    const input: AiGenerateInput = {
      position: generationInput.position.trim(), // 本次生成采用的目标岗位。
      workYears: generationInput.workYears.trim(), // 本次生成采用的职业阶段。
      supplement: generationInput.supplement.trim(), // 本次生成采用的补充事实。
    };
    if (!input.position || !input.workYears) {
      ElMessage.warning($t("resumeAiGenerateNeedBasics"));
      return;
    }
    if (!ensureReady()) return;
    controller?.abort();
    const requestController = new AbortController();
    controller = requestController;
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
      if (requestController.signal.aborted || controller !== requestController) return;
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
      if (controller === requestController) {
        controller = null;
        generating.value = false;
      }
    }
  };

  // 用户可随时取消当前生成，已填写资料与已有预览结果均保留。
  const cancel = () => {
    controller?.abort();
    controller = null;
    generating.value = false;
  };

  // 返回输入表单保留用户原始资料，方便调整后再次生成。
  const backToInput = () => {
    pendingItem.value = null;
  };

  // 结束一轮生成：中止请求并丢弃结果与来源，入口关闭或切页时使用。
  const reset = () => {
    cancel();
    pendingItem.value = null;
    generationWarnings.value = [];
    sourceItem.value = null;
    knownName.value = "";
  };

  onBeforeUnmount(cancel);

  return {
    generating,
    generationStage,
    pendingItem,
    generationWarnings,
    generationInput,
    start,
    generate,
    cancel,
    backToInput,
    reset,
  };
};

/** 流程组件对外句柄：入口通过它带入资料、读取结果状态并结束本轮生成。 */
export type AiGenerateFlowHandle = {
  /** 带入来源样式、预填资料与已知姓名。 */
  start: (item: Record<string, any>, initialInput?: Partial<AiGenerateInput>, initialName?: string) => void;
  /** 结束本轮生成并丢弃结果。 */
  reset: () => void;
  /** 是否已有可预览的生成结果。 */
  hasResult: boolean;
};
