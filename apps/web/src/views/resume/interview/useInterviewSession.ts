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
    if (!session || session.status === "completed") return;
    if (session.pendingAction) {
      const output = getInterviewOutput(session, session.pendingAction);
      if (output?.status === "generating") output.status = "interrupted";
    }
    session.status = "paused";
    save(session);
  };

  const request = async (action: InterviewAction) => {
    const session = current.value;
    const sessionState = state.value;
    if (disposed || !session || !sessionState || session.status === "completed" || sessionState.generating) return;
    // 当前动作只读取已派生的权限，不再另算一套推进状态。
    if (isInterviewHelperAction(action) ? !sessionState.canRequestHelp : sessionState.nextAction !== action) return;
    settleTime();
    let turn = session.turns.at(-1);
    if (action === "question" && (!turn || turn.submitted)) {
      const phase = session.turns.length
        ? getInterviewPhase(session.config, getInterviewCompletedCount(session.config, sessionState.submittedTurns))
        : INTERVIEW_INTRO_PHASE;
      session.turns.push(createInterviewTurn(phase));
      // 始终使用仓库中的响应式轮次，辅助标记与计时才能同步到界面。
      turn = session.turns.at(-1);
    }
    const output = getInterviewOutput(session, action);
    if (!output) return;
    const input = createInterviewTaskInput(session, action);
    session.pendingAction = action;
    session.status = "active";
    lastTick = Date.now();
    // 固定开场与未作答结束不经过模型请求，也不进入正在生成的中间状态。
    const localReply = getInterviewLocalReply(action, input);
    if (localReply !== null) {
      completeOutput(session, output, action, localReply);
      save(session);
      return;
    }
    if (!hasInterviewModel()) {
      session.status = "paused";
      save(session);
      ElMessage.warning("请先为面试官配置模型，再继续面试");
      return;
    }
    const version = ++requestVersion;
    const abortController = new AbortController();
    controller = abortController;
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
          // 实际看到辅助内容才标记使用辅助，网络失败不误扣作答依据。
          if (isInterviewHelperAction(action) && turn && delta.trim()) turn.assisted = true;
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
      session.status = "paused";
    } finally {
      if (isCurrent()) {
        controller = null;
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
      title: `${config.position} · ${getModeLabel(config.mode)}`, // 历史记录标题。
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
    session.status = "active";
    lastTick = Date.now();
    // 辅助生成中断后可以直接继续作答，需要时再打开辅助重新生成。
    if (isInterviewHelperAction(session.pendingAction)) session.pendingAction = null;
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

  // 结束允许在生成期间执行，先中止当前输出，再基于已提交的问答复盘。
  const finish = async () => {
    const session = current.value;
    const sessionState = state.value;
    if (disposed || !session || !sessionState || session.status === "completed" || sessionState.preparation) return;
    pause();
    session.endedEarly = session.config.mode !== "resume" && !isInterviewComplete(session.config, sessionState.submittedTurns);
    session.pendingAction = "report";
    save(session);
    await request("report");
  };

  // 定时显示与暂停、提交时使用同一计时口径。
  useIntervalFn(settleTime, 1000);

  useEventListener(window, "pagehide", pause);
  // 隐藏页面时保存当前草稿，页面切回仍保持原有训练节奏。
  useEventListener(document, "visibilitychange", () => { if (document.hidden && current.value) save(current.value); });
  // 页面离开后使尚未确认的异步操作失效，避免后台重新启动面试请求。
  onBeforeUnmount(() => { disposed = true; pause(); });

  return { store, current, select, start, pause, resume, submit, finish, request };
};
