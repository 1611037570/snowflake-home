import { computed, ref } from "vue";
import {
  createDefaultAssistantPrompt,
  createResumeAgentSession,
  createResumeTools,
  createSkillReferenceTool,
  describeResumeAiError,
  getResumeAiModel,
  hasResumeAiModel,
  resolveResumeAgentTaskProfile,
  resumeReferenceSkills,
  resumeTaskCapabilities,
  type ResumeAgentTaskEvidence,
} from "@snowflake/resume-agent";
import { evalCases } from "./cases";
import { evaluateAssertions } from "./assertions";
import { createEvalSandbox } from "./dataContext";
import { diffResume } from "./diff";
import { loadRuns, saveRun } from "./storage";
import type { EvalCase, EvalResult, EvalResumeView, EvalRun, EvalStep, EvalTaskSnapshot } from "./types";

// 单次运行最多用例数，避免误勾选后一次性消耗大量额度
const BATCH_LIMIT = 8;
// 每日运行次数上限，防止反复全量重跑
const DAILY_LIMIT = 3;
// 配额记录键
const QUOTA_KEY = "resume-eval-quota";
// 单条用例的最大推理轮次，与线上助手保持同一量级
const MAX_STEPS = 16;

type Quota = {
  // 记录所属日期
  date: string;
  // 当日已运行次数
  count: number;
};

// 启动结果：ok 为 false 时 reason 说明被拒绝的原因
type StartRunOutcome = {
  // 是否真正开始执行
  ok: boolean;
  // 未开始时的可读原因
  reason?: string;
  // 结束后的本次运行记录
  run?: EvalRun;
};

const readQuota = (): Quota => {
  const today = new Date().toDateString();
  try {
    const raw = localStorage.getItem(QUOTA_KEY);
    const parsed = raw ? (JSON.parse(raw) as Quota) : null;
    if (parsed?.date === today && typeof parsed.count === "number") return parsed;
  } catch {
    // 记录损坏时按当日零次处理
  }
  return { date: today, count: 0 };
};

const writeQuota = (quota: Quota) => {
  try {
    localStorage.setItem(QUOTA_KEY, JSON.stringify(quota));
  } catch {
    // 配额记录失败不阻断评测
  }
};

// 运行状态放在模块作用域，切换页签或离开页面时不会中断正在执行的评测
const running = ref(false);
const currentCaseId = ref("");
const liveResults = ref<EvalResult[]>([]);
const runs = ref<EvalRun[]>([]);
const modelReady = ref(false);
const modelName = ref("");
const quotaUsed = ref(0);
let controller: AbortController | null = null;
let abortSession: (() => void) | null = null;
let runsLoaded = false;

// 刷新模型可用状态，用户切到别的页面配置模型后回来仍能运行
const refreshModelState = () => {
  modelReady.value = hasResumeAiModel("xiaoZhou");
  modelName.value = getResumeAiModel("xiaoZhou")?.model ?? "";
  quotaUsed.value = readQuota().count;
};

// 首次进入页面时读取历史运行
const ensureRunsLoaded = async () => {
  if (runsLoaded) return;
  runsLoaded = true;
  runs.value = await loadRuns();
};

// 执行一条用例：沙箱隔离真实简历，产出工具轨迹与断言结论
const runOne = async (evalCase: EvalCase): Promise<EvalResult> => {
  const startedAt = Date.now();
  const sandbox = createEvalSandbox(evalCase.resume);
  const evidence: ResumeAgentTaskEvidence[] = [];
  const steps: EvalStep[] = [];
  let answer = "";
  let tokens = 0;
  let error: string | undefined;
  // 规划建立的任务契约：判断模型把本轮理解成写入任务还是纯回复任务
  let taskSnapshot: EvalTaskSnapshot | undefined;

  try {
    const taskProfile = await resolveResumeAgentTaskProfile(evalCase.source);
    const session = await createResumeAgentSession({
      taskId: `${evalCase.id}-${startedAt}`,
      source: evalCase.source,
      fallbackObjective: evalCase.prompt,
      capabilities: resumeTaskCapabilities,
      tools: [
        createSkillReferenceTool(resumeReferenceSkills),
        ...createResumeTools({
          ...sandbox.ctx,
          allowModuleTitleEdit: taskProfile?.allowModuleTitleEdit !== false,
        }),
      ],
      taskProfile,
      reactConfig: {
        maxSteps: MAX_STEPS,
        // 评测统一关闭深度思考，控制耗时与用量
        thinking: { type: "disabled" },
        onToken: (total) => {
          tokens = total;
        },
      },
      onEvidence: (item) => {
        evidence.push(item);
        steps.push({
          sequence: item.sequence,
          tool: item.tool,
          kind: item.kind,
          status: item.status,
          summary: item.summary,
          changed: item.changed,
          at: Date.now(),
        });
      },
      onTrace: (event) => {
        // 只有建立任务的事件带契约，验收结论不参与展示
        if (event.type !== "planned" && event.type !== "implicit") return;
        taskSnapshot = {
          objective: event.task.objective,
          requiredEffects: event.task.requiredEffects,
          successCondition: event.task.successCondition,
          capabilityIds: event.task.capabilityIds,
          implicit: event.type === "implicit",
        };
      },
      assertActive: () => {
        if (controller?.signal.aborted) throw new Error("评测已取消");
      },
    });
    abortSession = session.abort;
    answer = await session.run([
      { role: "system", content: createDefaultAssistantPrompt().instructions },
      { role: "user", content: evalCase.prompt },
    ]);
  } catch (caught) {
    error = controller?.signal.aborted ? "已取消" : describeResumeAiError(caught);
  } finally {
    abortSession = null;
  }

  // 写入后的快照先深拷贝，避免后续运行或页面引用到同一份对象
  const finalView = JSON.parse(JSON.stringify(sandbox.getView())) as EvalResumeView;
  const assertions = evaluateAssertions(evalCase.assertions, {
    evidence,
    answer,
    view: finalView,
    origin: evalCase.resume,
  });
  const changes = evidence
    .filter((item) => item.kind === "resume_change" && item.changed !== false)
    .flatMap((item) => item.verifiedChanges ?? [])
    .map((item) => `${item.module}｜${item.summary}`);

  return {
    caseId: evalCase.id,
    runAt: startedAt,
    passed: !error && assertions.every((item) => item.passed),
    durationMs: Date.now() - startedAt,
    tokens,
    answer,
    error,
    steps,
    assertions,
    changes,
    task: taskSnapshot,
    diff: diffResume(evalCase.resume, finalView),
    resumeAfter: finalView,
  };
};

// 开始一次评测：串行执行，任一条都可随时中断，结束后写入历史
const startRun = async (caseIds: string[]): Promise<StartRunOutcome> => {
  if (running.value) return { ok: false, reason: "已有评测正在执行" };
  refreshModelState();
  if (!modelReady.value) return { ok: false, reason: "尚未配置可用的简历助手模型" };
  const targets = evalCases.filter((item) => caseIds.includes(item.id));
  if (!targets.length) return { ok: false, reason: "请先选择要运行的用例" };
  if (targets.length > BATCH_LIMIT) {
    return { ok: false, reason: `单次最多运行 ${BATCH_LIMIT} 条用例` };
  }
  const quota = readQuota();
  if (quota.count >= DAILY_LIMIT) {
    return { ok: false, reason: `今日评测次数已用完（上限 ${DAILY_LIMIT} 次）` };
  }
  writeQuota({ date: quota.date, count: quota.count + 1 });
  quotaUsed.value = quota.count + 1;

  controller = new AbortController();
  running.value = true;
  liveResults.value = [];
  const startedAt = Date.now();

  for (const evalCase of targets) {
    currentCaseId.value = evalCase.id;
    if (controller.signal.aborted) break;
    const result = await runOne(evalCase);
    liveResults.value = [...liveResults.value, result];
  }

  const aborted = controller.signal.aborted;
  currentCaseId.value = "";
  running.value = false;
  abortSession = null;
  controller = null;

  const run: EvalRun = {
    id: `${startedAt}`,
    startedAt,
    finishedAt: Date.now(),
    model: modelName.value,
    caseCount: liveResults.value.length,
    passed: liveResults.value.filter((item) => item.passed).length,
    tokens: liveResults.value.reduce((total, item) => total + item.tokens, 0),
    durationMs: Date.now() - startedAt,
    aborted,
    results: [...liveResults.value],
  };
  // 一条都没跑成时不写入历史，避免留下空记录
  if (run.caseCount) runs.value = await saveRun(run);
  return { ok: true, run };
};

// 停止当前评测：中断模型请求并跳出后续用例
const stopRun = () => {
  controller?.abort();
  abortSession?.();
};

export const useEvalRun = () => {
  const passing = computed(() => liveResults.value.filter((item) => item.passed).length);
  const finished = computed(() => liveResults.value.length);
  const dailyLeft = computed(() => Math.max(0, DAILY_LIMIT - quotaUsed.value));

  return {
    // 状态
    running,
    currentCaseId,
    liveResults,
    runs,
    modelReady,
    modelName,
    quotaUsed,
    dailyLeft,
    passing,
    finished,
    batchLimit: BATCH_LIMIT,
    dailyLimit: DAILY_LIMIT,
    // 动作
    startRun,
    stopRun,
    refreshModelState,
    ensureRunsLoaded,
  };
};
