// 需要跨轮保留的任务技能：会话中始终只保留最近一个，辅助知识技能仅在当轮工具结果中使用。
const PERSISTENT_TASK_SKILL_IDS = new Set([
  "resume_translate",
  "self_intro",
  "greeting",
  "interview_prediction",
  "specialized_interview",
  "aptitude_hr_interview",
  "job_match",
  "resume_optimization",
  "resume_create",
  "resume_interview",
  "resume_score",
  "resume_one_key_adjust",
  "resume_one_key_optimize",
  "career_planning",
  "life_summary",
]);

// 判断技能是否属于需要跨轮延续的任务流程。
export const isPersistentTaskSkillId = (skillId?: string): boolean =>
  !!skillId && PERSISTENT_TASK_SKILL_IDS.has(skillId);
