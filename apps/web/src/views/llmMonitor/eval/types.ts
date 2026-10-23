import type { ResumeAgentTaskEvidence } from "@snowflake/resume-agent";

// 评测快照：结构与 read_resume_data 返回值一致，以模块 key 为键
export type EvalResumeView = Record<string, { title?: string; data: unknown }>;

// 断言类型：只声明人能读懂的行为契约，不直接写 expect
export type EvalAssertionKind =
  // 必须成功调用指定工具
  | "toolCalled"
  // 不允许调用指定工具
  | "toolNotCalled"
  // 多个工具按给定顺序成功执行
  | "toolOrder"
  // 本轮不得产生真实简历写入
  | "noWrite"
  // 不得写入快照中不存在的身份资料
  | "noFabricatedIdentity"
  // 富文本字段必须是合法 HTML
  | "htmlValid"
  // 写入后必须同步展示语言
  | "languageSynced"
  // 最终报告列出的改动必须与真实写入一致
  | "reportChanges";

export type EvalAssertion = {
  // 断言类型
  kind: EvalAssertionKind;
  // 展示给使用方的人话描述
  label: string;
  // 参与顺序或包含判断的工具名
  tools?: string[];
};

// 单条用例：固定输入 + 期望行为
export type EvalCase = {
  // 用例稳定标识
  id: string;
  // 分组名称，用于勾选与筛选
  group: string;
  // 用例展示名
  title: string;
  // 功能入口标识，决定加载哪个按钮任务配置
  source: string;
  // 本轮用户消息
  prompt: string;
  // 固定简历快照，不随用户真实数据变化
  resume: EvalResumeView;
  // 期望行为列表
  assertions: EvalAssertion[];
};

// 断言求值结果
export type EvalAssertionResult = {
  // 对应断言的展示描述
  label: string;
  // 是否满足
  passed: boolean;
  // 失败时的期望与实际对照
  detail?: string;
};

// 单条用例执行时记录的工具事实
export type EvalStep = {
  // 工具真实执行顺序
  sequence: number;
  // 工具名称
  tool: string;
  // 证据类型：读取、写入、草稿提交或语言同步
  kind: string;
  // 执行状态：成功、部分成功或失败
  status: string;
  // 结果摘要
  summary: string;
  // 是否真实改变了数据
  changed?: boolean;
  // 记录时间
  at: number;
};

// 规划阶段建立的任务契约，用于判断模型是否把本轮理解成写入任务
export type EvalTaskSnapshot = {
  // 计划目标
  objective: string;
  // 要求真实产生的业务效果
  requiredEffects: string[];
  // 完成条件
  successCondition: string;
  // 选中的任务能力
  capabilityIds: string[];
  // 是否由工具效果降级建立
  implicit: boolean;
};

// 单字段改动：快照写入前后的差异项
export type EvalChange = {
  // 字段的可读路径
  path: string;
  // 改动前的值
  before: string;
  // 改动后的值
  after: string;
};

// 单条用例的执行结果
export type EvalResult = {
  // 对应用例标识
  caseId: string;
  // 执行时间
  runAt: number;
  // 全部断言是否通过
  passed: boolean;
  // 本条耗时
  durationMs: number;
  // 模型用量近似值
  tokens: number;
  // 最终回答正文
  answer: string;
  // 执行失败时的可读原因
  error?: string;
  // 工具轨迹
  steps: EvalStep[];
  // 断言逐条结论
  assertions: EvalAssertionResult[];
  // 本轮实际写入摘要
  changes: string[];
  // 规划建立的任务契约，未建立时为空
  task?: EvalTaskSnapshot;
  // 快照写入前后的字段级差异
  diff?: EvalChange[];
  // 写入后的完整简历视图
  resumeAfter?: EvalResumeView;
};

// 一次评测运行
export type EvalRun = {
  // 运行标识
  id: string;
  // 开始时间
  startedAt: number;
  // 结束时间
  finishedAt: number;
  // 使用的模型展示名
  model: string;
  // 本轮用例数量
  caseCount: number;
  // 通过数量
  passed: number;
  // 累计用量近似值
  tokens: number;
  // 总耗时
  durationMs: number;
  // 是否被主动中断
  aborted: boolean;
  // 逐条结果
  results: EvalResult[];
};

// 断言求值所需的上下文
export type EvalAssertionContext = {
  // 工具证据
  evidence: ResumeAgentTaskEvidence[];
  // 最终回答正文
  answer: string;
  // 写入后的简历视图
  view: EvalResumeView;
  // 评测开始前的原始快照
  origin: EvalResumeView;
};
