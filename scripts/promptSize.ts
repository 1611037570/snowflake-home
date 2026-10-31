// 统计各智能体提示词与工具声明的体积，用于定位 Token 消耗来源。
// 由 prompt-size.mjs 打包后执行，不参与应用构建。
import { registerResumeSchema } from "@/views/resume/shared/resumeSchemaProvider";
import { createDefaultAssistantPrompt } from "@snowflake/resume-agent/prompts/defaultAssistant";
import { createResumeAgentTaskRuntime } from "@snowflake/resume-agent/runtime/resumeAgentTask";
import { createResumeTools } from "@snowflake/resume-agent/tools/index";
import { createSkillReferenceTool } from "@snowflake/resume-agent/tools/skillLoader";
import {
  resumeReferenceSkills,
  resumeSkillRegistry,
  resumeTaskCapabilities,
} from "@snowflake/resume-agent/skills/registry";
import { resumeDataContract } from "@snowflake/resume-agent/skills/skill_resume_data_contract";
import { ONE_KEY_OPTIMIZE_TASK } from "@snowflake/resume-agent/tasks/oneKeyOptimize";
import { CONTENT_REWRITE_TASK } from "@snowflake/resume-agent/tasks/contentRewrite";
import { createReferenceTool } from "@snowflake/agent";
import { resumeIndustryKnowledge } from "@snowflake/resume-core";
import { createInterviewPrompt } from "@snowflake/interview-agent/prompts";

// 与运行时压缩口径一致：中文按一字一令牌，其余按四字符一令牌
const countTokens = (text: string) => {
  const cjk = text.match(/[\u3400-\u9fff\uf900-\ufaff]/g)?.length ?? 0;
  return cjk + Math.ceil((text.length - cjk) / 4);
};

type Row = {
  group: string; // 所属分组。
  name: string; // 条目名称。
  chars: number; // 字符数。
  tokens: number; // 估算令牌数。
  counted: boolean; // 是否计入静态总量：合计行与实际请求内容不计。
};
const rows: Row[] = [];
const add = (group: string, name: string, text: string, counted = true) => {
  rows.push({ group, name, chars: text.length, tokens: countTokens(text), counted });
};

// 工具声明按发送给模型的 function calling 结构序列化后再统计
const toToolPayload = (tool: any) =>
  JSON.stringify({ type: "function", function: { name: tool.name, description: tool.description, parameters: tool.parameters } });

registerResumeSchema();

// 单字段改写用一次真实请求的输入构造系统提示
const rewriteMessages = CONTENT_REWRITE_TASK.buildMessages({
  action: "polish",
  kindKey: "work",
  moduleKey: "work",
  moduleTitle: "工作经历",
  language: "中文",
  payload: {},
});
add("单字段改写", "系统提示", rewriteMessages.map((message) => message.content ?? "").join("\n"));

// 简历助手：常驻提示与两份入口的运行规则
add("简历助手", "常驻身份提示", createDefaultAssistantPrompt().instructions);
const businessTools = [
  createSkillReferenceTool(resumeReferenceSkills),
  ...createResumeTools({
    getResumeData: () => ({}),
    allowModuleTitleEdit: true,
    applyResumeOperations: () => ({}) as any,
  }),
];
const chatRuntime = createResumeAgentTaskRuntime({
  taskId: "prompt-size",
  source: "chat",
  capabilities: resumeTaskCapabilities,
  tools: businessTools,
  allowTaskPause: true,
} as any);
add("简历助手", "任务运行规则（chat）", chatRuntime.buildContext());
const optimizeRuntime = createResumeAgentTaskRuntime({
  taskId: "prompt-size",
  source: "oneKeyOptimize",
  capabilities: resumeTaskCapabilities,
  tools: businessTools,
  taskProfile: ONE_KEY_OPTIMIZE_TASK,
  allowTaskPause: false,
} as any);
add("简历助手", "任务运行规则（一键优化）", optimizeRuntime.buildContext());

// 工具声明：每次请求都要重发，按全量与首轮两种口径分别统计
const allTools = [...chatRuntime.controlTools, ...chatRuntime.wrapTools(businessTools)] as any[];
const toolTotal = allTools.reduce((total, tool) => total + countTokens(toToolPayload(tool)), 0);
allTools.forEach((tool) => add("工具声明", tool.name, toToolPayload(tool)));
rows.push({ group: "工具声明", name: "合计（全量）", chars: 0, tokens: toolTotal, counted: false });
const planOnly = allTools.filter((tool) => tool.name === "plan_resume_task");
add("工具声明", "合计（首轮只发规划）", planOnly.map(toToolPayload).join(""), false);

// 参考知识正文：读取一次后留在上下文中
add("参考知识", "简历数据规范（全量）", resumeDataContract().instructions);
add("参考知识", "简历数据规范（单模块 work）", resumeDataContract({ module: "work" }).instructions);
for (const resource of resumeReferenceSkills) {
  if (resource.id === "resume_data_contract") continue;
  const skill = "load" in resource ? await resource.load() : resource;
  add("参考知识", skill.name, skill.instructions);
}

// 任务能力正文：规划选中后注入
for (const capability of resumeSkillRegistry.filter((skill) => skill.role === "task")) {
  const skill = "load" in capability ? await capability.load() : capability;
  add("任务能力", skill.name, skill.instructions);
}

// 面试智能体：逐轮请求 = 系统提示 + 只读工具 + 本场设置与已提交历史
const interviewModes: [string, string][] = [
  ["resume", "简历面试"],
  ["specialized", "专项面试"],
  ["hr", "行测与人事"],
  ["prediction", "押题"],
  ["intro", "自我介绍"],
];
// 本场设置按前端实际传入的结构构造，未填项留空字符串
const interviewInput = (mode: string, turns: unknown[] = []) => ({
  config: {
    mode,
    position: "前端工程师",
    experienceYears: "3-5 年",
    company: "某互联网公司",
    direction: "前端工程化",
    language: "中文",
    jobDescription: "",
    background: "",
  },
  resume: {},
  turns,
  question: "",
  clarificationRequest: "",
  previousReference: "",
  phase: "技术基础",
  endedEarly: false,
} as any);

for (const [mode, label] of interviewModes) {
  for (const [action, actionLabel] of [["question", "出题"], ["report", "复盘"]] as const) {
    try {
      const prompt = await createInterviewPrompt(action, interviewInput(mode));
      // 该模式没有对应动作时技能为空，模板会留下 undefined
      if (/undefined/.test(prompt)) continue;
      add("面试助手", `${label} · ${actionLabel}`, prompt);
    } catch {
      // 缺失的动作技能直接跳过，不影响其他模式统计
    }
  }
}

// 只读工具：简历快照与行业资料，逐轮都要重发
const interviewTools = [
  {
    name: "read_interview_resume",
    description: "读取本场固定的脱敏参考简历，返回全部模块标题和业务内容，不含媒体与编辑状态。",
    parameters: { type: "object", properties: {}, additionalProperties: false },
  },
  createReferenceTool({
    name: "read_interview_guidance",
    description: "按当前面试题型读取一项行业参考资料。",
    resources: resumeIndustryKnowledge,
    compactCatalog: true,
  }),
];
const interviewToolTotal = interviewTools.reduce((total, tool) => total + countTokens(toToolPayload(tool)), 0);
interviewTools.forEach((tool) => add("面试助手", `工具 ${tool.name}`, toToolPayload(tool)));
rows.push({ group: "面试助手", name: "工具合计", chars: 0, tokens: interviewToolTotal, counted: false });

// 历史按已提交题目累加，单题包含题干与作答
const oneTurn = {
  phase: "技术基础",
  question: "请说明你在上一个项目中负责的模块，以及遇到的最难的技术问题。",
  answer: "我在上一个项目负责简历编辑器的分页引擎，最难的是双栏布局下的分页测量。我按模块高度累加并与页面可用高度比对，处理了跨页拆分和空白裁剪，最终把预览与导出一致性做到了 95%。",
  skipped: false,
  durationSeconds: 120,
};
const turnTokens = countTokens(JSON.stringify(oneTurn));
add("面试助手", "历史增量（每题合计）", JSON.stringify(oneTurn), false);

// 输出：按分组打印，并对固定开销给出每轮合计
const groupOrder = ["简历助手", "工具声明", "参考知识", "任务能力", "单字段改写", "面试助手"];
const pad = (text: string, width: number) =>
  [...text].length >= width ? text : text + " ".repeat(width - [...text].length);
const width = Math.max(...rows.map((row) => [...row.name].length)) + 2;

groupOrder.forEach((group) => {
  const items = rows.filter((row) => row.group === group);
  if (!items.length) return;
  console.log(`\n${group}`);
  items.forEach((row) => {
    const size = row.chars ? `${row.tokens} token / ${row.chars} 字符` : `${row.tokens} token`;
    console.log(`  ${pad(row.name, width)}${size}`);
  });
  // 小计只累加可以同时独立计入的条目，不含合计行与模拟内容
  const subtotal = items.filter((row) => row.counted).reduce((total, row) => total + row.tokens, 0);
  console.log(`  ${pad("小计", width)}${subtotal} token`);
});

// 固定开销 = 每轮都要重发的部分
const defaultPromptTokens = countTokens(createDefaultAssistantPrompt().instructions);
const chatContextTokens = countTokens(chatRuntime.buildContext());
const optimizeContextTokens = countTokens(optimizeRuntime.buildContext());
const planOnlyTokens = countTokens(planOnly.map(toToolPayload).join(""));
const chatFirst = defaultPromptTokens + chatContextTokens + planOnlyTokens;
const chatRound = defaultPromptTokens + chatContextTokens + toolTotal;
const optimizeFirst = defaultPromptTokens + optimizeContextTokens + planOnlyTokens;
const optimizeRound = defaultPromptTokens + optimizeContextTokens + toolTotal;

console.log(`\n每轮固定开销（常驻提示 + 运行规则 + 全部工具声明）：${chatRound} token`);
console.log(`首轮固定开销（工具只发规划）：${chatFirst} token`);

// 全部条目相加只用于看总量，这些内容不会在同一次请求里全部发送
const staticTotal = rows.filter((row) => row.counted).reduce((total, row) => total + row.tokens, 0);
console.log(`\n全部提示词与技能正文相加：${staticTotal} token（不会同时发送）`);

console.log("\n按轮数累计的固定开销：");
console.log("  轮数  简历助手     一键优化");
[1, 2, 3, 4, 5, 6].forEach((rounds) => {
  const chat = chatFirst + (rounds - 1) * chatRound;
  const optimize = optimizeFirst + (rounds - 1) * optimizeRound;
  console.log(`  ${String(rounds).padStart(2)} 轮  ${String(chat).padStart(6)} token  ${String(optimize).padStart(6)} token`);
});

// 面试每轮请求 = 出题系统提示 + 只读工具 + 本场设置与已提交历史
const interviewSystemTokens = countTokens(await createInterviewPrompt("question", interviewInput("resume")));
const interviewFixed = interviewSystemTokens + interviewToolTotal;
console.log("\n面试（简历面试 · 出题）按题数累计的输入：");
console.log("  题数  每次请求输入");
[1, 2, 3, 5, 6, 10].forEach((turns) => {
  // 第 n 题的请求携带前 n-1 题的题干与作答
  const input = interviewFixed + (turns - 1) * turnTokens;
  console.log(`  ${String(turns).padStart(2)} 题  ${String(input).padStart(6)} token`);
});
console.log(`  单题固定部分：${interviewFixed} token（系统提示 ${interviewSystemTokens} + 工具 ${interviewToolTotal}），每题历史约 ${turnTokens} token`);
