import type { ChatMessage, ReactTool } from "@snowflake/ai";
import { getResumeAiMessage } from "../request/messages";
import { createResumeAgentSession } from "../runtime/resumeAgentSession";
import type { ResumeAgentTool } from "../runtime/types";
import { resumeDataContract } from "../skills/skill_resume_data_contract";
import { resumeWriting } from "../skills/skill_resume_writing";
import { createSkillReferenceTool } from "../tools/skillLoader";
import { isResumeMediaField } from "../schema/resumeMedia";
import { getResumeModuleSchema, resolveResumeModuleSchema } from "../schema/resumeSchema";
import { RESUME_SCHEMA } from "../schema/resumeSchemaRegistry";
import { validateFieldValue } from "../tools/resumeEdits";

// 通用简历草稿输入：由功能入口组合生成要求与目标模块。
export type ResumeDraftGenerationInput = {
  // 本轮草稿的写作要求，不包含用户原始资料。
  brief: string;
  // 功能入口收集的原始事实资料，仅通过读取工具提供。
  facts: string;
  // 本轮要求生成的稳定模块标识。
  requiredModules: string[];
  // 当前专业技能布局，未指定时不限制技能形态。
  skillLayout?: "text" | "proficiency";
};

export type ResumeDraftGenerationStage =
  // 正在理解入口任务与用户目标。
  | "analyzing"
  // 正在加载任务技能并读取用户资料。
  | "preparing"
  // 正在组织与撰写简历内容。
  | "generating"
  // 正在提交并整理结构化简历数据。
  | "structuring";

export type RunResumeDraftGenerationOptions = {
  // 外部取消信号，用于关闭弹窗或主动取消生成。
  signal?: AbortSignal;
  // 阶段变化回调，用于展示当前生成进度。
  onStage?: (stage: ResumeDraftGenerationStage) => void;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

// 草稿提交前核对模块形态与字段契约，避免仅凭提示词接收任意对象。
export const validateGeneratedResume = (value: unknown): string | null => {
  if (!isRecord(value) || !Object.keys(value).length) return "简历草稿必须包含模块数据";
  if (!RESUME_SCHEMA.length) return "简历字段契约尚未就绪";
  for (const [moduleKey, moduleValue] of Object.entries(value)) {
    const moduleSchema = getResumeModuleSchema(RESUME_SCHEMA, moduleKey);
    if (!moduleSchema || moduleSchema.kind === "custom" || !isRecord(moduleValue) || !("data" in moduleValue)) {
      return `简历草稿模块 ${moduleKey} 不符合字段契约`;
    }
    const data = moduleValue.data;
    const activeSchema = resolveResumeModuleSchema(moduleSchema, data);
    const records = activeSchema?.kind === "object" && isRecord(data)
      ? [data]
      : activeSchema?.kind === "array" && Array.isArray(data) && data.every(isRecord)
        ? data
        : null;
    if (!records || !activeSchema) return `简历草稿模块 ${moduleKey} 的数据形态无效`;
    const fields = new Map(activeSchema.fields.map((field) => [field.key, field]));
    for (const record of records) {
      for (const [fieldKey, fieldValue] of Object.entries(record)) {
        const field = fields.get(fieldKey);
        if (!field || isResumeMediaField(moduleKey, fieldKey)) {
          return `简历草稿模块 ${moduleKey} 包含未声明或不可写字段 ${fieldKey}`;
        }
        const errors: string[] = [];
        validateFieldValue(moduleKey, fieldKey, fieldValue, field, errors);
        if (errors.length) return errors[0]!;
      }
    }
  }
  return null;
};

const createInputTool = (input: ResumeDraftGenerationInput): ResumeAgentTool => ({
  name: "read_resume_generation_input",
  description: "读取本轮草稿要求、目标模块和专业技能布局，作为结构化简历草稿的生成依据。",
  parameters: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
  // 入口资料只通过工具交给执行智能体，避免把资料内容当成系统指令。
  execute: () => ({
    input, // 本轮草稿的资料、模块范围和布局要求。
  }),
  taskMeta: {
    effect: "read", // 该工具只读取入口资料。
    evidenceKind: "read", // 成功后生成资料读取证据。
    // 入口资料成功返回后记录读取证据。
    evaluate: (result) => {
      const success = Boolean(result && typeof result === "object" && "input" in result);
      return {
        status: success ? "success" : "failed",
        summary: success ? "已读取简历生成入口资料" : "未能读取简历生成入口资料",
      };
    },
  },
});

const createSubmitTool = (
  onSubmit: (resume: Record<string, unknown>) => void,
  requiredModules: string[],
  skillLayout?: "text" | "proficiency",
): ResumeAgentTool => ({
  name: "submit_generated_resume",
  description: "提交已经完成的结构化简历草稿。生成任务必须通过本工具返回结果。",
  parameters: {
    type: "object",
    properties: {
      resume: {
        type: "object",
        description: "按稳定模块 key 组织的完整简历草稿，每个模块包含 data 字段。",
      },
    },
    required: ["resume"],
    additionalProperties: false,
  },
  execute: (args) => {
    // 提交范围由功能入口指定，通用能力不固定业务模块。
    const missingModule = requiredModules.find((key) => !isRecord(args?.resume) || !(key in args.resume));
    if (missingModule) return { accepted: false, error: `简历草稿缺少请求生成的模块 ${missingModule}` };
    const unexpectedModule = Object.keys(args.resume as Record<string, unknown>).find((key) => !requiredModules.includes(key));
    if (unexpectedModule) return { accepted: false, error: `简历草稿包含未请求的模块 ${unexpectedModule}` };
    const validationError = validateGeneratedResume(args?.resume);
    if (validationError) {
      // 格式错误作为工具结果返回，让同一 ReAct 能调整草稿后继续提交。
      return {
        accepted: false, // 本次草稿没有被入口接收。
        error: validationError, // 提供给模型的修正原因。
      };
    }
    // 有技能布局要求时，提交数据必须与当前展示形态一致。
    const skillModule = (args.resume as Record<string, unknown>).skill;
    const skillData = isRecord(skillModule) ? skillModule.data : undefined;
    const validSkill = !skillLayout || !requiredModules.includes("skill") ? true : skillLayout === "text"
      ? isRecord(skillData) && typeof skillData.content === "string" && Boolean(skillData.content.trim())
      : Array.isArray(skillData) && skillData.some((record) => isRecord(record) && typeof record.name === "string" && Boolean(record.name.trim()));
    if (!validSkill) {
      return { accepted: false, error: skillLayout === "text" ? "当前模板的专业技能需要富文本正文" : "当前模板的专业技能需要技能列表" };
    }
    // 拒绝旧式核实尾标，未知细节改在原位置使用 XX 占位。
    if (JSON.stringify(args.resume).includes("【待核实】")) {
      return { accepted: false, error: "不要输出【待核实】，请在未知细节处使用 XX" };
    }
    // 模块存在但内容为空时继续交给模型补写，不能把空模块算作已生成。
    const emptyModule = requiredModules.find((key) => {
      const module = (args.resume as Record<string, unknown>)[key];
      const data = isRecord(module) ? module.data : undefined;
      return Array.isArray(data)
        ? !data.some((record) => isRecord(record) && Object.keys(record).length > 0)
        : !isRecord(data) || !Object.keys(data).length;
    });
    if (emptyModule) return { accepted: false, error: `简历草稿模块 ${emptyModule} 没有内容` };
    // 当前形态要求正文时，不能只提交名称等字段充当完整草稿。
    const missingContent = requiredModules.find((key) => {
      const module = (args.resume as Record<string, unknown>)[key];
      const data = isRecord(module) ? module.data : undefined;
      const schema = resolveResumeModuleSchema(getResumeModuleSchema(RESUME_SCHEMA, key), data);
      if (!schema?.fields.some((field) => field.key === "content" && field.required)) return false;
      const records = Array.isArray(data) ? data : [data];
      return !records.some((record) => isRecord(record) && typeof record.content === "string" && record.content.trim());
    });
    if (missingContent) return { accepted: false, error: `简历草稿模块 ${missingContent} 缺少正文` };
    // 只有提交工具接收的数据会成为页面预览，聊天正文不参与数据写入。
    onSubmit(args.resume as Record<string, unknown>);
    return { accepted: true, modules: Object.keys(args.resume) };
  },
  taskMeta: {
    effect: "submit", // 该工具提交独立简历草稿。
    evidenceKind: "draft_submit", // 成功后生成草稿提交证据。
    requiresEvidence: ["read"], // 草稿提交前必须读取本轮入口资料。
    replayScope: "task", // 相同草稿在本轮生成任务内只提交一次。
    // 只有提交工具明确接收草稿后才生成草稿完成证据。
    evaluate: (result) => {
      const success = Boolean(result && typeof result === "object" && "accepted" in result &&
        (result as Record<string, unknown>).accepted === true
      );
      return {
        status: success ? "success" : "failed",
        summary: success ? "已提交结构化简历草稿" : "未能提交结构化简历草稿",
      };
    },
  },
});

// 入口先理解任务，再让 ReAct 加载技能、读取资料并自行调用工具完成生成。
export const runResumeDraftGeneration = async (
  input: ResumeDraftGenerationInput,
  options: RunResumeDraftGenerationOptions = {},
): Promise<Record<string, unknown>> => {
  // 通用草稿仅要求明确本轮需求与目标模块，具体采集项由入口决定。
  if (!input.brief.trim() || !input.facts.trim() || !input.requiredModules.length) throw new Error("请提供草稿要求、资料和目标模块");
  const writingSkill = resumeWriting();
  let submittedResume: Record<string, unknown> | null = null;
  const businessTools: ReactTool[] = [
    createSkillReferenceTool([resumeDataContract()]),
    createInputTool(input),
    createSubmitTool((resume) => {
      submittedResume = resume;
    }, input.requiredModules, input.skillLayout),
  ];
  let inputRead = false;
  options.onStage?.("analyzing");
  const session = await createResumeAgentSession({
    taskId: `resumeDraftGeneration:${Date.now()}`,
    source: "resumeDraftGeneration",
    capabilities: [writingSkill],
    tools: businessTools,
    preferredCapabilityId: writingSkill.id,
    fixedRequiredEffects: ["draft_submit"],
    fixedSuccessCondition: "按本轮目标模块提交完整可编辑的结构化简历草稿",
    allowTaskPause: false,
    reactConfig: {
      maxSteps: 12,
      // 新建草稿需要综合稀疏资料与模块取舍，允许模型使用推理能力。
      thinking: { type: "enabled" },
      onThink: () => {
        if (inputRead && !submittedResume) options.onStage?.("generating");
      },
      onAct: (toolCall) => {
        if (toolCall.function.name === "plan_resume_task") {
          options.onStage?.("analyzing");
          return;
        }
        if (["read_resume_guidance", "submit_generated_resume"].includes(toolCall.function.name)) {
          options.onStage?.("structuring");
          return;
        }
        if (toolCall.function.name === "read_resume_generation_input") inputRead = true;
        options.onStage?.("preparing");
      },
    },
  });
  const abortRunner = () => session.abort();
  options.signal?.addEventListener("abort", abortRunner, { once: true });
  if (options.signal?.aborted) session.abort();

  // 入口只描述本轮草稿目标，读取、字段核对和提交由统一任务运行规则编排。
  const messages: ChatMessage[] = [{ role: "user", content: input.brief }];

  try {
    await session.run(messages);
  } finally {
    options.signal?.removeEventListener("abort", abortRunner);
  }
  if (!submittedResume) throw new Error(getResumeAiMessage("emptyGeneration"));
  return submittedResume;
};
