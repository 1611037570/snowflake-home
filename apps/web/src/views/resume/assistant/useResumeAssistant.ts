import { useAiStore, useResumeStore } from "@/stores";
import { ToolNotFoundError } from "@/apis";
import { storeToRefs } from "pinia";
import { referenceSkills, residentSkills, taskCapabilities } from "./routing/registry";
import {
  buildToolGuide,
  createSkillReferenceTool,
  RESUME_LANG_CODES,
} from "@snowflake/resume-agent";
import type { AssistantConfig, AssistantResources } from "./types";
import { collectResumeAdjustmentIssues, useProgress } from "../editor/hooks/useProgress";
import { useResumeContext } from "./context/useResumeContext";
import { createResumeChangeObserver } from "./changes/captureChanges";
import type { ResumeChangeCallbacks } from "./changes/types";

// 简历助手唯一组装器：入口只消费本模块产出的 config 与创建对话方法
export const useResumeAssistant = () => {
  const aiStore = useAiStore();
  const resumeStore = useResumeStore();
  const { isGenerating } = storeToRefs(resumeStore);
  const { createDefaultChat, createDefaultMessage } = aiStore;
  const resumeContext = useResumeContext();

  const updateCurrentLang = (language: string): boolean => {
    const ui = resumeStore.currentUI;
    if (!ui || !RESUME_LANG_CODES.includes(language)) return false;
    ui.content.language = language;
    return true;
  };
  // 能力与工具在首次请求时才组装，避免进入 AI 面板时提前加载。
  const resolveTools = async (context?: Record<string, unknown>, changes?: ResumeChangeCallbacks): Promise<AssistantResources> => {
    // 入口与验收范围从本轮请求读取，异步加载期间不依赖共享可变状态。
    const entryFlow = context?.entryFlow;
    const requiresResumeIssueClosure = context?.requireResumeIssueClosure === true;
    const { createResumeTools, resolveResumeAgentTaskProfile } = await import("@snowflake/resume-agent");
    const taskProfile = await resolveResumeAgentTaskProfile(entryFlow);
    // 详情只订阅本轮助手写入，不进入模型上下文或简历持久化。
    const observe = changes ? createResumeChangeObserver({
      readData: () => resumeStore.currentData, // 读取原始业务内容
      getModuleTitle: (key) => resumeStore.getModel(key)?.name || key, // 模块展示名称
      getLayout: (key) => resumeStore.currentUI?.[key]?.layout, // 当前字段形态
    }, changes) : undefined;
    return {
      capabilities: taskCapabilities,
      taskProfile,
      tools: [
        // 参考知识通过单一工具按需读取，任务能力由首轮任务契约直接返回正文。
        createSkillReferenceTool(referenceSkills),
        ...createResumeTools({
          getResumeData: resumeContext.getResumeData,
          allowModuleTitleEdit: taskProfile?.allowModuleTitleEdit !== false,
          applyResumeOperations: (operations) => {
            return resumeStore.applyResumeOperations(operations, observe);
          },
          // 复用左侧完成度检查口径，写入工具无需维护第二套验收规则
          getResumeIssues: requiresResumeIssueClosure
            ? () => collectResumeAdjustmentIssues(
                useProgress(
                  resumeStore.runtimeFields || [],
                  resumeStore.currentData || {},
                  resumeStore.currentUI || {},
                ),
              )
            : undefined,
          // 翻译的展示语言使用独立工具写入，单独记录其实际变化。
          updateLanguage: (language) => {
            const before = resumeStore.currentUI?.content?.language || "zh";
            const updated = updateCurrentLang(language);
            if (updated && changes && before !== language) {
              try {
                changes.onChange({
                  type: "update", // 展示语言修改
                  location: "简历 · 展示语言", // 语言设置位置
                  fields: [{ label: "展示语言", before, after: language, formatOnly: false }], // 切换前后的语言
                });
              } catch {
                try { changes.onError(); } catch { /* 详情异常不影响展示语言写入 */ }
              }
            }
            return updated;
          },
        }),
      ],
    };
  };
  // 请求配置：技能工具、简历工具与请求上下文统一在此装配
  const config: AssistantConfig = {
    generating: isGenerating,
    resolveTools,
    // 工具名未注册属可恢复错误：返回错误与可用工具清单让模型重调；其它执行错误保持中断
    onToolError: ({ error, tools }) => {
      if (error instanceof ToolNotFoundError) {
        return { error: error.message, guide: buildToolGuide(tools) };
      }
      return undefined;
    },
    beforeRequest: (options, taskId) => {
      resumeContext.beforeRequest(options, taskId);
    },
    afterRequest: (taskId) => {
      resumeContext.afterRequest(taskId);
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
