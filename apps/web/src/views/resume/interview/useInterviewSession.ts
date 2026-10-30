import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useDebounceFn, useEventListener, useIntervalFn } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { hasInterviewModel, runInterviewTask } from "@snowflake/interview-agent";
import type { InterviewAction, InterviewConfig } from "@snowflake/interview-agent";
import type { ResumeSnapshot } from "@snowflake/resume-core";
import { getUUID } from "@/utils";
import { INTERVIEW_INTRO_PHASE, INTERVIEW_INTRO_SECONDS, createInterviewOutput, createInterviewTurn, getInterviewLocalReply, getInterviewCompletedCount, getInterviewPhase, getModeLabel, isInterviewComplete } from "./config";
import { createInterviewTaskInput, getInterviewOutput, getInterviewSessionState, isInterviewHelperAction } from "./sessionFlow";
import { useInterviewStore } from "./storage";
import type { InterviewOutput, InterviewSession } from "./types";

export const useInterviewSession = () => {
  const store = useInterviewStore();
  const currentId = ref("");
  const current = computed(() => store.sessions.find((session) => session.id === currentId.value));
  const state = computed(() => current.value ? getInterviewSessionState(current.value) : null);
  let controller: AbortController | null = null;
  let activeOutput: InterviewOutput | null = null;
  let requestVersion = 0;
  let lastTick = Date.now();
  let disposed = false;

  const save = (session: InterviewSession) => {
    session.updatedAt = Date.now();
    void store.save(session).catch(() => {});
  };

  // 状态切换前结算不足一秒的时间，避免暂停或连续请求丢失作答时长。
  const settleTime = () => {
    const now = Date.now();
    const delta = Math.max(0, now - lastTick);
    lastTick = now;
    const session = current.value;
    if (!session || !state.value || session.status !== "active" || state.value.reviewing || state.value.preparation) return;
    session.elapsedMs += delta;
    const turn = state.value.latestTurn;
    if (state.value.canSubmit && turn) {
      const previousDuration = turn.durationSeconds;
      // 开场题就绪后开始计时，到时封存用时和草稿，等待用户确认提交。
      turn.durationSeconds = turn.phase === INTERVIEW_INTRO_PHASE
        ? Math.min(INTERVIEW_INTRO_SECONDS, previousDuration + delta / 1000)
        : previousDuration + delta / 1000;
      if (turn.phase === INTERVIEW_INTRO_PHASE && previousDuration < INTERVIEW_INTRO_SECONDS && turn.durationSeconds >= INTERVIEW_INTRO_SECONDS) save(session);
    }
  };

  // 草稿输入防抖落库，逐字输出只在请求结束、停止或离开时保存。
  const saveDraft = useDebounceFn(() => { if (current.value) save(current.value); }, 350);
  watch(() => current.value?.draft, () => { void saveDraft(); });

  // 固定内容与模型返回共用完成处理，避免输出完成却仍残留待办动作。
  const completeOutput = (session: InterviewSession, output: InterviewOutput, action: InterviewAction, content: string) => {
    output.content = content;
    output.error = "";
    output.status = "complete";
    session.pendingAction = null;
    if (action === "report" || action === "preparation") session.status = "completed";
  };

  // 停止首先使旧回调失效，再中断网络；已生成文字与当前草稿保留。
  const pause = () => {
    const session = current.value;
    settleTime();
    ++requestVersion;
    controller?.abort();
    controller = null;
    // 逐题回看可在面试结束后单独停止，不改变已完成的复盘状态。
    const output = activeOutput;
    activeOutput = null;
    if (output?.status === "generating") output.status = "interrupted";
    if (!session) return;
    if (session.status === "completed") { if (output) save(session); return; }
    // 题意说明属于可选帮助，停止后允许直接继续原题，不强制重新生成。
    if (session.pendingAction === "clarification") session.pendingAction = null;
    session.status = "paused";
    save(session);
  };

  const request = async (action: InterviewAction, turnId?: string) => {
    const session = current.value;
    const sessionState = state.value;
    if (disposed || !session || !sessionState || sessionState.generating || controller) return;
    const reviewingAnswer = isInterviewHelperAction(action);
    let turn = reviewingAnswer ? session.turns.find((item) => item.id === turnId) : session.turns.at(-1);
    // 面试中禁止辅助；结束后只允许回看实际提交过的正式题。
    if (reviewingAnswer) {
      if (!sessionState.canReviewAnswers || !turn?.submitted || turn.phase === INTERVIEW_INTRO_PHASE || turn.question.status !== "complete") return;
    } else if (session.status === "completed" || sessionState.nextAction !== action) return;
    if (action === "clarification" && (!turn || turn.submitted || turn.phase === INTERVIEW_INTRO_PHASE || !turn.clarifications?.length)) return;
    settleTime();
    if (action === "question" && (!turn || turn.submitted)) {
      const phase = session.turns.length
        ? getInterviewPhase(session.config, getInterviewCompletedCount(session.config, sessionState.submittedTurns))
        : INTERVIEW_INTRO_PHASE;
      session.turns.push(createInterviewTurn(phase));
      // 始终使用仓库中的响应式轮次，使生成与计时同步到界面。
      turn = session.turns.at(-1);
    }
    const output = getInterviewOutput(session, action, turnId);
    if (!output) return;
    const input = createInterviewTaskInput(session, action, turnId);
    if (!reviewingAnswer) {
      session.pendingAction = action;
      session.status = "active";
      lastTick = Date.now();
    }
    // 固定开场与未作答结束不经过模型请求，也不进入正在生成的中间状态。
    const localReply = getInterviewLocalReply(action, input);
    if (localReply !== null) {
      completeOutput(session, output, action, localReply);
      save(session);
      return;
    }
    if (!hasInterviewModel()) {
      if (!reviewingAnswer) session.status = "paused";
      if (action === "clarification") session.pendingAction = null;
      save(session);
      ElMessage.warning("请先为面试官小羊配置模型，再继续面试");
      return;
    }
    const version = ++requestVersion;
    const abortController = new AbortController();
    controller = abortController;
    activeOutput = output;
    output.content = "";
    output.error = "";
    output.status = "generating";
    save(session);
    const isCurrent = () => version === requestVersion && currentId.value === session.id;
    try {
      const content = await runInterviewTask(action, input, {
        signal: abortController.signal, // 与停止、切换和离开页面共用中止信号。
        onReset: () => { if (isCurrent()) output.content = ""; }, // 工具读取和内容核对重试不累积临时正文。
        onContent: (delta) => {
          if (!isCurrent()) return;
          output.content += delta;
        }, // 旧请求不能覆盖新会话。
      });
      if (!isCurrent()) return;
      settleTime();
      completeOutput(session, output, action, content);
    } catch (error) {
      if (!isCurrent()) return;
      settleTime();
      output.status = abortController.signal.aborted ? "interrupted" : "error";
      output.error = abortController.signal.aborted ? "" : error instanceof Error ? error.message : "生成失败，请重试";
      if (!reviewingAnswer) session.status = "paused";
      if (action === "clarification") session.pendingAction = null;
    } finally {
      if (isCurrent()) {
        controller = null;
        activeOutput = null;
        save(session);
      }
    }
  };

  const select = (id: string) => {
    if (id === currentId.value) return;
    pause();
    currentId.value = id;
    lastTick = Date.now();
  };

  const start = async (config: InterviewConfig, resumeId: string, resumeTitle: string, resumeSnapshot: ResumeSnapshot) => {
    if (disposed) return;
    pause();
    const session: InterviewSession = {
      id: getUUID(), // 面试独立编号。
      title: config.mode === "intro" ? getModeLabel(config.mode) : `${config.position} · ${getModeLabel(config.mode)}`, // 自我介绍无需岗位，直接使用功能名称。
      createdAt: Date.now(), // 面试创建时间。
      updatedAt: Date.now(), // 初始更新时间。
      config: JSON.parse(JSON.stringify(config)), // 固定用户确认的训练设置。
      resumeId, // 可选参考简历标识，未关联时为空。
      resumeTitle, // 可选参考简历标题，未关联时为空。
      resumeSnapshot, // 独立保存脱敏快照，未关联时为空对象。
      status: "paused", // 确认独立存储成功后才发起请求。
      elapsedMs: 0, // 初始训练用时。
      draft: "", // 初始作答草稿。
      turns: [], // 初始问答列表。
      preparation: createInterviewOutput(), // 准备材料输出。
      report: createInterviewOutput(), // 面试复盘输出。
      pendingAction: null, // 初始动作由统一流程决策后写入。
      endedEarly: false, // 尚未提前结束。
    };
    const action = getInterviewSessionState(session).nextAction;
    session.pendingAction = action;
    store.sessions.unshift(session);
    currentId.value = session.id;
    const version = requestVersion;
    try {
      await store.save(session);
      // 创建期间切换、暂停或离开后，不再替另一个会话发起首题。
      if (version !== requestVersion || currentId.value !== session.id || !action) return;
      await request(action);
    } catch {
      // 保存失败保留内存记录与明确错误，用户重试保存后仍可继续。
    }
  };

  const resume = async () => {
    const session = current.value;
    if (disposed || !session || session.status === "completed" || state.value?.generating) return;
    // 继续前先确认当前记录可保存，等待期间切换、暂停或再次继续会使本次操作失效。
    const version = ++requestVersion;
    try { await store.save(session); }
    catch { return; }
    if (disposed || version !== requestVersion || currentId.value !== session.id) return;
    session.status = "active";
    lastTick = Date.now();
    const action = state.value?.nextAction;
    if (action) await request(action);
    else save(session);
  };

  const submit = async (skip = false) => {
    const session = current.value;
    const turn = state.value?.latestTurn;
    if (disposed || !session || !turn || !state.value?.canSubmit) return;
    const answer = session.draft.trim();
    if (!skip && !answer) return;
    settleTime();
    turn.answer = skip ? "" : answer;
    turn.skipped = skip;
    turn.submitted = true;
    session.draft = "";
    session.pendingAction = state.value?.nextAction ?? null;
    save(session);
    if (session.pendingAction) await request(session.pendingAction);
  };

  // 澄清只写入原题对话，不提交回答、不创建新题，也不触发阶段完成。
  const clarify = async () => {
    const session = current.value;
    const turn = state.value?.latestTurn;
    if (disposed || !session || !turn || !state.value?.canSubmit || turn.phase === INTERVIEW_INTRO_PHASE) return;
    settleTime();
    const previous = turn.clarifications?.at(-1);
    // 没有新疑问时复用未完成的说明；继续原题不依赖这次重试成功。
    if (session.draft.trim() || !previous || previous.reply.status === "complete") {
      (turn.clarifications ||= []).push({
        id: getUUID(), // 同题内每次澄清都有独立输出标识。
        request: session.draft.trim() || (session.config.language === "英语" ? "Please clarify what this question is asking." : "请解释这道题的意思和作答范围。"), // 可直接澄清，也可使用用户填写的具体疑问。
        reply: createInterviewOutput(), // 澄清输出支持停止和原地重试。
      });
    }
    session.draft = "";
    session.pendingAction = "clarification";
    save(session);
    await request("clarification");
  };

  // 结束允许在生成期间执行，先中止当前输出，再基于已提交的问答复盘。
  const finish = async () => {
    const session = current.value;
    const sessionState = state.value;
    if (disposed || !session || !sessionState || session.status === "completed" || sessionState.preparation || sessionState.reviewing) return;
    // 已进入复盘时只能继续或重试原任务，重复结束不能中止并重开复盘请求。
    pause();
    session.endedEarly = session.config.mode !== "resume" && !isInterviewComplete(session.config, sessionState.submittedTurns);
    session.pendingAction = "report";
    save(session);
    await request("report");
  };

  // 定时显示与暂停、提交时使用同一计时口径。
  useIntervalFn(settleTime, 1000);

  useEventListener(window, "pagehide", pause);
  // 切换可见性时先结算真实经过的时间，后台计时被节流后也不能短暂恢复过期输入。
  useEventListener(document, "visibilitychange", () => {
    settleTime();
    if (document.hidden && current.value) save(current.value);
  });
  // 页面离开后使尚未确认的异步操作失效，避免后台重新启动面试请求。
  onBeforeUnmount(() => { disposed = true; pause(); });

  return { store, current, select, start, pause, resume, submit, clarify, finish, request };
};
