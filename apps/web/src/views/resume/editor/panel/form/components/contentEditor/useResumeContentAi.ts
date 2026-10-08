import { onBeforeUnmount, ref, watch, type Ref } from "vue";
import { ElMessage } from "element-plus";
import DOMPurify from "dompurify";
import { getXiaoZhouLLM, isAbortError } from "@/apis";
import { useResumeStore } from "@/stores";
import { useResumeAiAvailability } from "@/views/resume/hooks/useResumeAiAvailability";
import { RICH_TEXT_SANITIZE_CONFIG } from "../../../../preview/shared/richTextSanitize";

// 当前正文支持的操作类型
type ContentAiAction = "generate" | "polish" | "simplify";

// 三种操作各自的处理方式，差异只体现在对待处理正文的改法
const ACTION_INSTRUCTIONS: Record<ContentAiAction, string> = {
  generate: "基于给出的事实撰写这段简历正文，当前正文仅作参考",
  polish: "在事实不变的前提下润色当前正文，改善专业表达与信息密度",
  simplify: "精简当前正文，保留关键职责、行动与成果，删去套话与重复",
};

// 不同字段类型的写法与篇幅要求
const KIND_RULES: Record<string, string> = {
  work: "工作经历：动词开头，突出职责、动作与量化成果，正文 120~200 字",
  project: "项目经历：说明项目背景、个人职责与实际成果，正文 120~200 字",
  education: "教育经历：主修课程、在校表现与荣誉，正文 60~120 字",
  skill: "专业技能：按能力分组列举，可用列表，共 6~10 条",
  advantage: "个人优势：概括核心竞争力，正文 80~120 字",
};

// 简历展示语言与输出语言名称的对应关系
const LANGUAGE_NAMES: Record<string, string> = {
  zh: "中文",
  en: "英文",
  ja: "日文",
  ko: "韩文",
  fr: "法文",
  de: "德文",
  es: "西班牙文",
  ru: "俄文",
};

// 去掉模型偶发输出的代码围栏
const stripFence = (text: string) => text.trim().replace(/^```(?:html)?\s*|\s*```$/g, "");

// 字段正文 AI：单次流式请求产出预览，用户确认后才写入编辑器
export const useResumeContentAi = (
  content: Ref<string>,
  getFieldKey: () => string | undefined,
  kind: () => string,
) => {
  const resumeStore = useResumeStore();
  const { ensureAiAvailable } = useResumeAiAvailability();
  const loading = ref(false);
  // 流式累积的预览正文，展示前统一清洗
  const previewHtml = ref("");
  // 失败信息，为空表示本次生成没有出错
  const errorText = ref("");
  // 本次预览对应的操作，用于卡片标题
  const activeAction = ref<ContentAiAction>("generate");
  let version = 0;
  let abort: (() => void) | undefined;
  // 发起生成时的正文快照，采用前核对用户是否已手动改动
  let original = "";

  const cancel = () => {
    version += 1;
    abort?.();
    abort = undefined;
    if (loading.value) resumeStore.isGenerating = false;
    loading.value = false;
  };
  // 放弃预览：中止请求并清空卡片内容
  const discardResult = () => {
    cancel();
    previewHtml.value = "";
    errorText.value = "";
  };
  // 字段卸载或切换简历后取消请求，不把旧结果写入新的字段
  onBeforeUnmount(cancel);
  watch(() => resumeStore.currentItem?.id, discardResult);

  const runAiContent = async (action: ContentAiAction) => {
    if (loading.value || resumeStore.isGenerating || !ensureAiAvailable()) return;
    const fieldKey = getFieldKey();
    const match = fieldKey?.match(/^([^.]+)\.(?:list\.(\d+)\.)?data\.content$/);
    if (!match) {
      ElMessage.warning("无法定位当前简历字段");
      return;
    }
    const moduleKey = match[1]!;
    const index = match[2] === undefined ? undefined : Number(match[2]);
    const item = resumeStore.currentItem;
    const module = item?.data?.[moduleKey];
    const record = index === undefined ? module?.data : module?.list?.[index]?.data;
    if (!item || !record) return;
    const currentText = stripFence(String(content.value ?? ""));
    if (action !== "generate" && !currentText) {
      ElMessage.warning("请先填写要处理的内容");
      return;
    }
    // 事实只取当前记录中除正文以外的字段，避免把待处理正文当成事实
    const facts = Object.fromEntries(
      Object.entries(record).filter(
        ([key, value]) => key !== "content" && value !== "" && value != null,
      ),
    );
    const language = LANGUAGE_NAMES[item.ui?.content?.language] || "中文";
    const taskVersion = ++version;
    original = String(content.value ?? "");
    activeAction.value = action;
    previewHtml.value = "";
    errorText.value = "";
    loading.value = true;
    resumeStore.isGenerating = true;
    let raw = "";
    try {
      const llm = getXiaoZhouLLM();
      if (!llm) throw new Error("请先配置并选择 AI 模型");
      const messages = [
        {
          // 固定事实范围与输出格式，资料中的指令不生效
          role: "system",
          content:
            `你是简历正文写作助手。只使用给出的真实事实，禁止编造单位、职责、技术、时间与数字，缺失的事实用【待补充：具体事实】占位。` +
            `只输出可直接使用的富文本片段：段落用 <p>，强调用 <strong>，列表用 <ul><li>；不要输出解释、标题、代码围栏、JSON、脚本或图片。` +
            `${KIND_RULES[kind()] || ""}。请使用${language}输出。`,
        },
        {
          // 本次操作与最小必要事实
          role: "user",
          content: `${ACTION_INSTRUCTIONS[action]}。资料仅作事实参考：${JSON.stringify({
            // 求职方向
            position: item.data?.user?.data?.position || "",
            // 当前待处理正文
            currentText,
            // 当前记录中除正文外的真实事实
            facts,
          })}`,
        },
      ];
      const { sendFn, abortFn } = await llm.request({
        // 按已配置协议传递请求正文
        options:
          llm.protocol === "responses"
            ? {
                // 响应协议的消息列表
                input: messages,
                // 正文处理不生成推理过程
                thinking: { type: "disabled" },
              }
            : {
                // 对话协议的消息列表
                messages,
                // 正文处理不生成推理过程
                thinking: { type: "disabled" },
              },
        // 流式返回，边生成边展示
        isStream: true,
        // 返回富文本，不要求 JSON
        isJson: false,
        // 不输出资料调试信息
        isDebug: false,
        // 避免重复调用产生多份结果
        retryCount: 0,
        // 增量正文实时清洗后写入预览
        onContent: (delta: string) => {
          if (taskVersion !== version) return;
          raw += delta;
          previewHtml.value = DOMPurify.sanitize(stripFence(raw), RICH_TEXT_SANITIZE_CONFIG);
        },
      });
      abort = abortFn;
      if (taskVersion !== version) {
        abortFn();
        return;
      }
      await sendFn();
      if (taskVersion !== version) return;
      if (!previewHtml.value.trim()) throw new Error("模型没有返回有效正文");
    } catch (error) {
      if (taskVersion === version && !isAbortError(error)) {
        errorText.value = error instanceof Error ? error.message : "内容处理失败";
      }
    } finally {
      if (taskVersion === version) {
        abort = undefined;
        loading.value = false;
        resumeStore.isGenerating = false;
      }
    }
  };

  // 采用预览结果：正文未被手动改动时才写入编辑器
  const applyResult = () => {
    if (loading.value || !previewHtml.value) return;
    if (String(content.value ?? "") !== original) {
      ElMessage.warning("正文已改动，请重新生成");
      return;
    }
    content.value = previewHtml.value;
    discardResult();
  };

  return {
    // 是否正在生成
    loading,
    // 流式预览正文，已清洗
    previewHtml,
    // 失败信息，为空表示无错误
    errorText,
    // 本次预览对应的操作
    activeAction,
    // 发起生成、润色或简化
    runAiContent,
    // 采用预览结果写入正文
    applyResult,
    // 放弃预览结果
    discardResult,
  };
};
