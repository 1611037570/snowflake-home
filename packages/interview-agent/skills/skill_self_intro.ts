import type { InterviewSkillPrompts } from "../types";

// 自我介绍只维护口头稿写法，事实边界由面试公共提示统一提供。
export const selfIntro: InterviewSkillPrompts = {
  preparation: `参考用户选择的目标字数与风格，用候选人第一人称把最相关的背景、经历和优势自然串起来，不照抄简历条目或堆满所有经历。只输出一段可直接朗读的口头稿，不加标题、列表、点评或追问。`, // 口头稿格式独立维护，不加载模拟面试的出题与评分规则。
};
