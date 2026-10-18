import { useAiStore, useResumeStore } from "@/stores";
import { ToolNotFoundError } from "@/apis";
import type { ReactTool } from "@/apis/llm/react";
import { storeToRefs } from "pinia";
import { buildToolGuide } from "./toolGuide";
import { onDemandSkills, residentSkills } from "./skills/registry";
import { createSkillTools } from "./skills/tool_skill_loader";
import { useResumeContext } from "./resumeContext";
import { RESUME_LANG_CODES } from "./tools/tool_update_resume_language";
import type { AssistantConfig } from "./types";
import { collectResumeAdjustmentIssues, useProgress } from "../hooks/useProgress";

// 简历助手唯一组装器：入口只消费本模块产出的 config 与创建对话方法
export const useResumeAssistant = () => {
  const aiStore = useAiStore();
  const resumeStore = useResumeStore();
  const { isGenerating } = storeToRefs(resumeStore);
  const { createDefaultChat, createDefaultMessage } = aiStore;
  const resumeContext = useResumeContext();
  // 每次请求独立记录写入结果，语言工具只能在本轮完整写入成功后执行
  let hasSuccessfulWrite = false;
  let activeTaskId = "";
  // 当前请求是否需要用完成度问题作为写后验收条件
  let requiresResumeIssueClosure = false;

  const updateCurrentLang = (language: string): boolean => {
    const ui = resumeStore.currentUI;
    if (!ui || !RESUME_LANG_CODES.includes(language)) return false;
    ui.content.language = language;
    return true;
  };
  // 工具在首次请求时才组装：技能正文与简历工具（含表单结构）不进入 AI 面板首屏
  const resolveTools = async (): Promise<ReactTool[]> => {
    const [skills, { createResumeTools }] = await Promise.all([
      Promise.all(onDemandSkills.map((load) => load())),
      import("./tools"),
    ]);
    return [
      // 按需技能注册为只读工具，需要时由模型调用获取全文
      ...createSkillTools(skills),
      ...createResumeTools({
        getResumeData: resumeContext.getResumeData,
        applyResumeOperations: (operations) => {
          const result = resumeStore.applyResumeOperations(operations);
          if (result.applied && !result.failed.length) hasSuccessfulWrite = true;
          return result;
        },
        // 复用左侧完成度检查口径，写入工具无需维护第二套验收规则
        getResumeIssues: () =>
          requiresResumeIssueClosure
            ? collectResumeAdjustmentIssues(
                useProgress(
                  resumeStore.runtimeFields || [],
                  resumeStore.currentData || {},
                  resumeStore.currentUI || {},
                ),
              )
            : [],
        // 本轮每次写入尝试独立确认，后续失败时禁止复用早先凭据
        resetSuccessfulWrite: () => { hasSuccessfulWrite = false; },
        hasSuccessfulWrite: () => hasSuccessfulWrite,
        updateLanguage: updateCurrentLang,
      }),
    ];
  };
  // 请求配置：技能工具、简历工具与请求上下文统一在此装配
  const config: AssistantConfig = {
    generating: isGenerating,
    resolveTools,
    // 反思口径由简历域提供：仅检查冲突与格式，不做扩写，避免把提问等交互内容当成答案精炼
    reflectPrompt:
      "请检查上一条内容：若与用户任务冲突或格式被破坏，只输出修正后的完整内容；否则逐字原样输出。禁止输出任何解释、理解过程、思考、说明、标题或额外新增内容；若上一条内容本身是提问或交互内容，保持原样，不得拆分或补充新问题。",
    // 工具名未注册属可恢复错误：返回错误与可用工具清单让模型重调；其它执行错误保持中断
    onToolError: ({ error, tools }) => {
      if (error instanceof ToolNotFoundError) {
        return { error: error.message, guide: buildToolGuide(tools) };
      }
      return undefined;
    },
    beforeRequest: (options, taskId) => {
      // 新请求开始时清空上轮写入凭据，禁止跨请求复用
      hasSuccessfulWrite = false;
      requiresResumeIssueClosure = options?.requireResumeWrite === true;
      activeTaskId = taskId || "";
      resumeContext.beforeRequest(options, taskId);
    },
    afterRequest: (taskId) => {
      resumeContext.afterRequest(taskId);
      if (!taskId || taskId === activeTaskId) {
        hasSuccessfulWrite = false;
        requiresResumeIssueClosure = false;
        activeTaskId = "";
      }
    },
  };

  // 创建对话：常驻技能按清单顺序作为系统消息注入
  const createChat = () => {
    const resident = residentSkills.map((createSkill) => createSkill());
    const [first, ...rest] = resident;
    // 常驻技能清单为空时明确中断，不生成缺少系统规则的对话
    if (!first) throw new Error("简历助手缺少常驻技能");
    const newChat = createDefaultChat({
      ...createDefaultMessage(),
      role: "system",
      content: first.instructions,
      systemSkillId: first.id,
      typing: false,
    });
    // 简历助手对话仅服务于当前正在编辑的简历
    if (resumeStore.currentItem?.id) {
      newChat.resumeId = resumeStore.currentItem.id;
    }
    rest.forEach((skill) => {
      newChat.messages.push({
        ...createDefaultMessage(),
        role: "system",
        content: skill.instructions,
        systemSkillId: skill.id,
        typing: false,
      });
    });
    return newChat;
  };

  return { config, createChat };
};
