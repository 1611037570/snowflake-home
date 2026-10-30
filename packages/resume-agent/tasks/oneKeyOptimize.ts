import type { ResumeAgentTaskProfile } from "../runtime/taskTypes";

// 入口只声明目标和必要事实边界，写作方法与候选规则由通用技能负责。
export const ONE_KEY_OPTIMIZE_TASK: ResumeAgentTaskProfile = {
  id: "oneKeyOptimize", // 独立优化入口。
  preferredCapabilityId: "resume_optimization", // 优先采用通用优化方法，其他技能由 Agent 按需选择。
  allowModuleTitleEdit: false, // 本入口处理简历内容，不修改展示标题。
  allowRequestInput: false, // 一次完成草稿，不进入聊天追问。
  objective: "根据目标岗位与用户要求，尽可能完善简历草稿，突出个人贡献与岗位价值", // 由 Agent 判断改写重点和执行顺序。
  requiredEffects: [], // 优质内容允许保留，不为达到改动数量而强行写入。
  successCondition: "完成有依据的简历内容优化并核对最终草稿；无需修改时说明具体原因", // 不将评分和报告包装作为内容完成条件。
  completionPolicy: {
    requiredEvidence: ["read"], // 内容判断必须先读取真实简历。
    readAfterEvidence: ["resume_change"], // 最终判断仍须基于修改后的数据。
  },
  validateFinal: (_answer, evidence) => {
    // 只拦截尚未解决的真实写入失败，不再校验报告包装或强迫所有模块改写。
    const writes = evidence.filter((item) => item.kind === "resume_change" && !item.replayed);
    const lastWrite = writes[writes.length - 1];
    return lastWrite && lastWrite.status !== "success" ? {
      code: "unresolved", // 最新写入仍有失败项，不能标为全部完成。
      text: "最近一次修改尚未成功，请根据工具结果修正并重新提交，再读取最终草稿复核。", // 仅修复实际操作问题。
    } : null;
  },
  instructions: `# 目标
根据目标岗位、可选 JD 和优化重点，交出可以直接预览的完整简历草稿。先理解经历的价值，再决定结构、取舍和表达，不把优化局限于换几个词。按需要选择写作、岗位匹配、评估或参考知识，不必为走流程而加载无关内容。

# 内容边界
- 资料不完整不代表无法优化，处理已有内容，不要求所有模块齐全。综合优化可重组、合并重复表达、突出贡献与交付、调整记录顺序，并在现有模块内补充有依据的内容。
- 保留已经确认的身份、公司、学校、时间与具体成果，不虚构已获得的成绩。稀疏内容按共用写作规则起草与已有线索相容的职责、方法和成果候选，未知细节用 XX，并在 todo 中指出需要核实的内容；候选不计作已确认的成果。
- 精简模式只压缩已有内容；岗位匹配模式突出已有证据，不把 JD 要求复制成用户具备的能力。不删除唯一的真实工作、项目、教育记录或身份与联系方式，弱相关内容可精简和后置。
- 需要实际修改时调用写入工具，不以建议代替行动。工具指出失败项时只修复未完成部分，按实际需要批量或分步处理；最终核对事实、重复和遗漏，避免反复重写已经合适的内容。

# 最终说明
完成后返回简洁 JSON，包含 summary（本次结论）、changes（按模块说明具体问题、处理和改善）、todo（待补充或核实的事实）与 suggestions（剩余行动）。changes 每项可写 module、summary、problem、benefit；实际改动清单和前后摘录由程序根据真实数据生成，无需重复抄写。
评分仅在有依据时提供 dimensions，每项包含 name 与 score，维度可为信息完整度、阅读效率、职业契合度、职业成就、发展潜力、职业稳定性；不适用时为 null。不为凑评分或包装报告重复调用工具，优先完成实际内容。`, // 一次性入口只补充任务目标、事实边界与简洁报告约定。
};
