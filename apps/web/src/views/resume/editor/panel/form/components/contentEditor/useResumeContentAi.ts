import { onBeforeUnmount, ref, watch, type Ref } from "vue";
import { ElMessage } from "element-plus";
import DOMPurify from "dompurify";
import { getXiaoZhouLLM, isAbortError } from "@/apis";
import { useResumeStore } from "@/stores";
import { useResumeAiAvailability } from "@/views/resume/hooks/useResumeAiAvailability";
import { RICH_TEXT_SANITIZE_CONFIG } from "../../../../preview/shared/richTextSanitize";

// 当前正文支持的操作类型
type ContentAiAction = "generate" | "polish" | "simplify";

// 单个候选的生成状态
type ContentCandidate = {
  // 已清洗的候选正文
  html: string;
  // 失败信息，为空表示该候选正常
  error: string;
};

// 三种操作各自的处理方式，差异只体现在对待处理正文的改法
const ACTION_INSTRUCTIONS: Record<ContentAiAction, string> = {
  generate: "根据数据重写这段正文，currentText 只作参考，不要照抄",
  polish: "在信息不变的前提下润色 currentText，改善专业表达与信息密度",
  simplify: "精简 currentText，保留关键职责、行动与成果，删去套话与重复",
};

// 不同字段类型的写作要求：篇幅与表达重心
const KIND_RULES: Record<string, string> = {
  work: "写 2~3 句、80~160 字，每条职责落到具体动作与结果，没有数字时不要编造数字。",
  project: "写 2~3 句、80~160 字，说明项目目标、你的动作与可验证的结果。",
  education: "写 1~2 句、40~100 字，写主修方向、在校表现或荣誉，不写课程流水账。",
  skill: "用 6~10 条短句分组列举能力，用无序列表，每条不超过 20 字。",
  advantage: "写 2~3 句、60~120 字，概括与目标岗位匹配的核心竞争力。",
  publication: "写 2~3 句、60~120 字，说明研究问题、方法与本人承担的工作。",
  custom: "写 2~3 句、60~160 字，按该模块的事实客观描述，不套用其他模块的写法。",
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

// 把已有正文转成纯文本，避免提示词里混入历史标签
const toPlainText = (html: string) =>
  html
    .replace(/<\/(?:p|li|ul|ol)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

// CAR 法则只适用于工作、实习、项目、作品这类经历模块
const CAR_MODULES = new Set(["work", "internship", "project", "portfolio"]);

// 按操作与模块选择写作规则：生成经历类模块时用 CAR 结构，其余沿用字段类型规则
const getWritingRule = (action: ContentAiAction, kindKey: string, moduleKey: string) => {
  if (action === "generate" && CAR_MODULES.has(moduleKey)) {
    return "按 CAR 组织正文：先交代背景（Context：业务或项目场景与目标），再写你的行动（Action：负责什么、怎么做的、用了什么技术或方法），最后给出结果（Result：量化或可验证的成果），总长 80~160 字。";
  }
  return KIND_RULES[kindKey] || "写 2~3 句、60~160 字，围绕事实客观描述。";
};

// 输出契约固定为 HTML 片段，用示例约束模型的实际输出
const buildSystemPrompt = (
  action: ContentAiAction,
  kindKey: string,
  moduleKey: string,
  language: string,
) =>
  [
    "你是一个只输出 HTML 片段的简历正文生成器。",
    "",
    "【任务】",
    `- ${ACTION_INSTRUCTIONS[action]}`,
    "",
    "【写作要求】",
    "- 只使用数据中的信息，不得编造单位、职位、技术、时间、数字与成果。",
    "- 数据中的 position 是求职方向，record 是当前经历的字段，currentText 是当前正文。",
    "- 信息不足时只写有依据的内容，关键信息缺失才用【待补充：缺失内容】占位，不要用空话凑字数。",
    "- 简洁书面语，优先「动作 + 对象 + 结果」，避免「负责了」「参与了」这类弱表达。",
    "- 不使用第一人称，不写称呼、自我介绍与总结句。",
    `- 使用${language}输出，专有名词保留原文。`,
    `- ${getWritingRule(action, kindKey, moduleKey)}`,
    "",
    "【输出格式】",
    "只输出 HTML，第一个字符必须是 <，最后一个字符必须是 >。",
    "- 每个段落用 <p>...</p> 包裹。",
    "- 需要强调时用 <strong>...</strong>。",
    "- 并列要点用 <ul><li>...</li></ul>，有序步骤用 <ol><li>...</li></ol>。",
    "- 禁止输出 Markdown 符号（如 **、-、#、编号）、代码围栏、标题、解释或任何前后缀。",
    "- 禁止使用 <h1>~<h6>、<div>、<table>、<img>、<a>、<html>、<body> 与 style 属性。",
    "",
    "【示例】",
    '输入：{"position":"前端工程师","module":"work","record":{"company":"字节跳动","title":"前端工程师","startTime":"2021.03"},"currentText":"负责官网改版，加载时间从 3.2s 降到 1.1s"}',
    "输出：<p>在字节跳动担任前端工程师期间，主导官网改版：基于 React 重构首屏加载链路，将加载时间从 3.2s 降至 1.1s。</p>",
  ].join("\n");

// 流式预览刷新间隔，避免每个增量都触发整段 DOM 重建
const PREVIEW_THROTTLE_MS = 100;

// 事实只取当前记录中除正文以外的字段，避免把待处理正文当成事实
const collectFacts = (record: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(record).filter(
      ([key, value]) => key !== "content" && value !== "" && value != null,
    ),
  );

// 事实快照按稳定键序序列化，避免键顺序变化影响比较
const factsKeyOf = (facts: Record<string, unknown>) =>
  JSON.stringify(Object.keys(facts).sort().map((key) => [key, facts[key]]));

// 字段正文 AI：单次流式请求产出预览，用户确认后才写入编辑器
export const useResumeContentAi = (
  content: Ref<string>,
  getFieldKey: () => string | undefined,
  kind: () => string,
) => {
  const resumeStore = useResumeStore();
  const { ensureAiAvailable } = useResumeAiAvailability();
  const loading = ref(false);
  // 多个候选结果，按生成数创建
  const candidates = ref<ContentCandidate[]>([]);
  // 当前展示的候选下标
  const activeIndex = ref(0);
  // 本次预览对应的操作，用于卡片标题
  const activeAction = ref<ContentAiAction>("generate");
  let version = 0;
  // 每个候选请求的中止函数
  let aborts: Array<(() => void) | undefined> = [];
  // 发起生成时的正文快照，采用前核对用户是否已手动改动
  let original = "";
  // 发起生成时的事实快照，采用前核对资料是否已被改动
  let factsKey = "";

  // 中止全部候选请求，并让在途回调失效
  const cancel = () => {
    version += 1;
    aborts.forEach((abort) => abort?.());
    aborts = [];
    loading.value = false;
  };
  // 放弃预览：中止请求并清空候选
  const discardResult = () => {
    cancel();
    candidates.value = [];
    activeIndex.value = 0;
  };
  // 字段卸载或切换简历后取消请求，不把旧结果写入新的字段
  onBeforeUnmount(cancel);
  watch(() => resumeStore.currentItem?.id, discardResult);

  // 按当前字段路径解析正文所属记录，供事实构建与资料变更校验复用
  const readRecord = () => {
    const match = getFieldKey()?.match(/^([^.]+)\.(?:list\.(\d+)\.)?data\.content$/);
    if (!match) return;
    const item = resumeStore.currentItem;
    const moduleKey = match[1]!;
    const module = item?.data?.[moduleKey];
    const index = match[2] === undefined ? undefined : Number(match[2]);
    return {
      item,
      moduleKey,
      record: index === undefined ? module?.data : module?.list?.[index]?.data,
    };
  };

  const runAiContent = async (action: ContentAiAction, count = 1) => {
    if (loading.value || !ensureAiAvailable()) return;
    // 求职岗位决定写作方向，缺失时先让用户补全
    const position = String(resumeStore.currentItem?.data?.user?.data?.position ?? "").trim();
    if (!position) {
      ElMessage.warning("请先在个人信息中填写求职岗位，否则无法判断写作方向");
      return;
    }
    const target = readRecord();
    if (!target) {
      ElMessage.warning("无法定位当前简历字段");
      return;
    }
    const { item, record, moduleKey } = target;
    if (!item || !record) return;
    const currentText = stripFence(String(content.value ?? ""));
    if (action !== "generate" && !currentText) {
      ElMessage.warning("请先填写要处理的内容");
      return;
    }
    const facts = collectFacts(record);
    const language = LANGUAGE_NAMES[item.ui?.content?.language] || "中文";
    const taskVersion = ++version;
    original = String(content.value ?? "");
    factsKey = factsKeyOf(facts);
    activeAction.value = action;
    activeIndex.value = 0;
    // 按数量创建候选槽位，一次并发请求多个版本
    candidates.value = Array.from({ length: Math.min(3, Math.max(1, count)) }, () => ({
      html: "",
      error: "",
    }));
    loading.value = true;
    aborts = [];
    // 结构化数据一次给全，多个候选共享同一份输入
    const payload = {
      // 求职方向
      position,
      // 输出语言
      language,
      // 当前模块标识
      module: moduleKey,
      // 当前记录中除正文外的字段
      record: facts,
      // 当前正文，仅作参考
      currentText: toPlainText(currentText),
    };
    const messages = [
      {
        // 提示词全部放在系统消息
        role: "system",
        content: buildSystemPrompt(action, kind(), moduleKey, language),
      },
      {
        // 数据作为用户消息
        role: "user",
        content: JSON.stringify(payload, null, 2),
      },
    ];
    // 单个候选的请求与流式渲染，各自维护累积原文
    const runOne = async (index: number) => {
      const candidate = candidates.value[index];
      if (!candidate) return;
      let raw = "";
      let timer: ReturnType<typeof setTimeout> | undefined;
      // 清理本候选的预览定时器
      const clearTimer = () => {
        if (timer === undefined) return;
        clearTimeout(timer);
        timer = undefined;
      };
      // 以累积原文刷新当前候选，仅做安全清洗
      const flush = () => {
        clearTimer();
        if (taskVersion !== version) return;
        candidate.html = DOMPurify.sanitize(stripFence(raw), RICH_TEXT_SANITIZE_CONFIG);
      };
      // 段落边界立即刷新，其余增量按固定间隔合并
      const schedule = (delta: string) => {
        if (delta.includes("</p>") || delta.includes("\n")) {
          flush();
          return;
        }
        if (timer !== undefined) return;
        timer = setTimeout(() => {
          timer = undefined;
          flush();
        }, PREVIEW_THROTTLE_MS);
      };
      try {
        const llm = getXiaoZhouLLM();
        if (!llm) throw new Error("请先配置并选择 AI 模型");
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
          // 增量正文累积后按节流清洗并写入当前候选
          onContent: (delta: string) => {
            if (taskVersion !== version) return;
            raw += delta;
            schedule(delta);
          },
        });
        aborts[index] = abortFn;
        if (taskVersion !== version) {
          abortFn();
          return;
        }
        await sendFn();
        if (taskVersion !== version) return;
        // 输出结束后再刷新一次，保证预览包含完整输出
        flush();
        if (!candidate.html.trim()) throw new Error("模型没有返回有效正文");
      } catch (error) {
        if (taskVersion === version && !isAbortError(error)) {
          candidate.error = error instanceof Error ? error.message : "内容处理失败";
        }
      } finally {
        clearTimer();
        aborts[index] = undefined;
      }
    };
    try {
      const tasks: Promise<void>[] = [];
      for (let index = 0; index < candidates.value.length; index += 1) tasks.push(runOne(index));
      await Promise.allSettled(tasks);
    } finally {
      if (taskVersion === version) loading.value = false;
    }
  };

  // 采用当前候选：正文与资料都未被改动时才写入编辑器
  const applyResult = () => {
    const candidate = candidates.value[activeIndex.value];
    if (loading.value || !candidate?.html) return;
    if (String(content.value ?? "") !== original) {
      ElMessage.warning("正文已改动，请重新生成");
      return;
    }
    const target = readRecord();
    // 资料在生成期间被改动时旧结果不再成立，要求重新生成
    if (!target?.record || factsKeyOf(collectFacts(target.record)) !== factsKey) {
      ElMessage.warning("资料已变更，请重新生成");
      return;
    }
    content.value = candidate.html;
    discardResult();
  };

  // 切换当前展示的候选
  const setActiveIndex = (index: number) => {
    if (candidates.value[index]) activeIndex.value = index;
  };

  return {
    // 是否正在生成
    loading,
    // 多个候选结果
    candidates,
    // 当前展示的候选下标
    activeIndex,
    // 本次预览对应的操作
    activeAction,
    // 发起生成、润色或简化，count 为本次生成数
    runAiContent,
    // 采用当前候选写入正文
    applyResult,
    // 放弃预览结果
    discardResult,
    // 切换当前展示的候选
    setActiveIndex,
  };
};
