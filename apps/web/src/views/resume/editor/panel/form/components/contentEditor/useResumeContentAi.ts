import { onBeforeUnmount, ref, watch, type Ref } from "vue";
import { ElMessage } from "element-plus";
import { isAbortError } from "@/apis";
import { useResumeStore } from "@/stores";
import { useResumeAiAvailability } from "@/views/resume/hooks/useResumeAiAvailability";
import {
  CONTENT_REWRITE_TASK,
  LANGUAGE_NAMES,
  findResumeModuleSchema,
  normalizeRichTextHtml,
  runResumeAiTask,
  type ContentAiAction,
  type ContentRewriteInput,
} from "@snowflake/resume-agent";

// 单个候选的生成状态
type ContentCandidate = {
  // 已清洗的候选正文
  html: string;
  // 失败信息，为空表示该候选正常
  error: string;
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
  // 每个候选请求的取消控制器
  let controllers: Array<AbortController | undefined> = [];
  // 发起生成时的正文快照，采用前核对用户是否已手动改动
  let original = "";
  // 发起生成时的事实快照，采用前核对资料是否已被改动
  let factsKey = "";

  // 中止全部候选请求，并让在途回调失效
  const cancel = () => {
    version += 1;
    controllers.forEach((controller) => controller?.abort());
    controllers = [];
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
    // 模块标题帮助模型判断当前写的是哪类内容
    const moduleTitle =
      String(item.data?.[moduleKey]?.ui?.title ?? "").trim() ||
      findResumeModuleSchema(moduleKey)?.title ||
      moduleKey;
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
    controllers = [];
    // 结构化数据一次给全，多个候选共享同一份输入
    const payload = {
      // 当前模块标题，决定写作口径
      moduleTitle,
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
    // 任务输入一次组装，多个候选共用
    const taskInput: ContentRewriteInput = {
      // 本次操作类型
      action,
      // 当前字段类型
      kindKey: kind(),
      // 当前模块标识
      moduleKey,
      // 当前模块标题
      moduleTitle,
      // 输出语言
      language,
      // 提供给模型的字段事实
      payload,
    };
    // 单个候选的请求与流式渲染，各自维护累积原文
    const runOne = async (index: number) => {
      const candidate = candidates.value[index];
      if (!candidate) return;
      // 本次候选的取消控制器
      const controller = new AbortController();
      controllers[index] = controller;
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
        // 模型返回 Markdown 或纯文本时同步转换为编辑器可用的富文本 HTML
        candidate.html = normalizeRichTextHtml(raw);
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
        // 统一请求使用方负责协议、中止与流式增量
        await runResumeAiTask(CONTENT_REWRITE_TASK, taskInput, {
          signal: controller.signal,
          // 增量正文累积后按节流清洗并写入当前候选
          onContent: (delta) => {
            if (taskVersion !== version) return;
            raw += delta;
            schedule(delta);
          },
        });
        if (taskVersion !== version) return;
        // 输出结束后再刷新一次，保证预览包含完整输出
        flush();
        if (!candidate.html.trim()) throw new Error("模型没有返回有效正文");
      } catch (error) {
        if (taskVersion === version && !isAbortError(error)) {
          candidate.error = error instanceof Error ? error.message : "内容处理失败";
          // 失败的候选不能保留已收到的残片，否则会被当作正常结果采用
          candidate.html = "";
        }
      } finally {
        clearTimer();
        if (controllers[index] === controller) controllers[index] = undefined;
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
    // 生成失败的候选不允许写入，避免把失败请求的残片当成结果
    if (candidate.error) {
      ElMessage.warning("该候选生成失败，请重新生成");
      return;
    }
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
