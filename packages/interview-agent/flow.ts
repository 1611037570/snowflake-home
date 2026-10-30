import type { InterviewAction, InterviewConfig, InterviewHistoryTurn, InterviewTaskInput } from "./types";

// 开场独立限时，不占各类面试原有的正式题数。
export const INTERVIEW_INTRO_PHASE = "开场自我介绍";
export const INTERVIEW_INTRO_SECONDS = 120;

// 固定流程同样使用简短直白的文字，开场与未作答结束都能立即完成。
export const getInterviewLocalReply = (action: InterviewAction, input: InterviewTaskInput): string | null => {
  if (action === "question" && input.phase === INTERVIEW_INTRO_PHASE) {
    return input.config.language === "英语"
      ? `Please briefly introduce yourself in ${INTERVIEW_INTRO_SECONDS / 60} minutes.`
      : `请用${INTERVIEW_INTRO_SECONDS / 60}分钟简单介绍一下自己。`;
  }
  // 跳过记录只用于保留流程，不能作为可评分或可复盘的真实回答。
  if (action === "report" && !input.turns.some((turn) => !turn.skipped && turn.answer.trim())) {
    return input.config.language === "英语"
      ? "The interview has ended. There are no substantive answers to assess or score. Your unsubmitted draft is saved."
      : "面试已结束。尚无实际作答，暂不评价或评分。未提交草稿已保留。";
  }
  return null;
};

// 保留各类面试自己的完成规则，简历面试不设置固定总题数。
export const getInterviewQuestionLimit = (config: InterviewConfig): number | null =>
  config.mode === "specialized" ? 10 : config.mode === "hr" ? 16 : null;

export const getInterviewCompletedCount = (
  config: InterviewConfig,
  turns: Pick<InterviewHistoryTurn, "phase" | "skipped">[],
) => turns.filter((turn) => turn.phase !== INTERVIEW_INTRO_PHASE && (config.mode !== "specialized" || !turn.skipped)).length;

export const isInterviewComplete = (config: InterviewConfig, turns: Pick<InterviewHistoryTurn, "phase" | "skipped">[]) => {
  const limit = getInterviewQuestionLimit(config);
  return limit !== null && getInterviewCompletedCount(config, turns) >= limit;
};

// 开场结束后，正式题目继续沿用各类技能原有的顺序。
export const getInterviewPhase = (config: InterviewConfig, index: number) => {
  if (config.mode === "hr") {
    if (index < 10) {
      const category = ["言语理解", "数量关系", "判断推理"];
      return `行测模拟 · ${index === 9 ? "判断推理" : category[index % 3]}`;
    }
    const topics = ["求职动机", "协作沟通", "冲突处理", "压力应对", "主动性", "复盘成长"];
    return `HR 软技能面试 · ${topics[index - 10] || "复盘成长"}`;
  }
  if (config.mode === "specialized") return config.direction;
  return "综合面试";
};

export const getInterviewStages = (config: InterviewConfig) => config.mode === "hr"
  ? [INTERVIEW_INTRO_PHASE, "行测模拟", "HR 软技能面试"]
  : [INTERVIEW_INTRO_PHASE, getInterviewPhase(config, 0)];
