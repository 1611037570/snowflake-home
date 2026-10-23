import type { ResumeAgentTaskProfile } from "../runtime/taskTypes";

// 一键调整只由按钮入口装配，不注册为通用对话技能。
export const ONE_KEY_ADJUST_TASK: ResumeAgentTaskProfile = {
  id: "oneKeyAdjust", // 按钮任务稳定标识。
  preferredCapabilityId: "resume_writing", // 优先加载通用简历编写方法。
  allowModuleTitleEdit: false, // 问题调整不改变模块展示标题。
  // 一次性修复入口不向用户追问，缺失事实自行补齐后收口。
  allowRequestInput: false,
  objective: "修复整份简历当前检查发现的缺失、格式和时间线问题", // 按钮已经明确的任务目标。
  requiredEffects: ["resume_change"], // 本任务必须实际修改当前简历。
  successCondition: "当前可安全修复的简历问题已完成调整，并明确说明仍需补充的事实", // 用户可核对的完成条件。
  // 剩余问题可能依赖只能由用户提供的事实，不再要求本轮必须清零，避免修完也无法收口。
  completionPolicy: {},
  instructions: `# 任务范围
- 对照整份简历的检查结果只处理仍存在的问题，按字段格式和真实资料决定修复范围。
- 格式问题先从现有值无歧义修复；简介和技能等可从真实经历归纳。缺少日期、联系方式或经历事实时按共用写作规则使用 XX 占位补齐，不向用户追问；学历、学制等只能取自固定选项的字段无法确定时保留原值，不猜选项。
- 剩余问题依赖未知事实时保留原值，并在收口时列出所缺事实，不以同值内容冒充修复。
- 保持模块展示标题不变；若核对后本就没有可调整的问题，调用 report_resume_blocker 说明无需改动，不制造虚假写入。
- 不修改检查范围外的内容，不在执行中逐项询问；写入后若问题已清零，直接说明实际调整。仍有无法安全修复的问题时按阻塞状态收口，说明已完成的调整和所缺事实，不声称全部解决。

# 输出
简要列出实际完成的调整和待补充事实，不展示内部字段路径或工具过程。`, // 该按钮任务独有的执行与输出规则。
};
