import { useAiStore, useResumeStore } from "@/stores";
import { ToolNotFoundError } from "@/apis";
import { storeToRefs } from "pinia";
import { buildToolGuide } from "./toolGuide";
import { onDemandSkills, residentSkills } from "./skills/registry";
import { createSkillTools } from "./skills/tool_skill_loader";
import { useResumeContext } from "./resumeContext";
import { createResumeTools, RESUME_LANG_CODES } from "./tools";
import type { AssistantConfig } from "./types";
import { createResumeOperationBuffer } from "./resumeOperationBuffer";

// 简历助手唯一组装器：入口只消费本模块产出的 config 与创建对话方法
export const useResumeAssistant = () => {
  const aiStore = useAiStore();
  const resumeStore = useResumeStore();
  const { isGenerating } = storeToRefs(resumeStore);
  const { createDefaultChat, createDefaultMessage } = aiStore;
  const resumeContext = useResumeContext();

  const getRecordCount = (moduleKey: string) => {
    const module = (resumeStore.currentData as any)?.[moduleKey];
    if (Array.isArray(module?.data)) return module.data.length;
    if (Array.isArray(module?.data?.list)) return module.data.list.length;
    return 0;
  };
  const operationBuffer = createResumeOperationBuffer({
    apply: (operations) => resumeStore.applyResumeOperations(operations),
    getRecordCount,
  });
  const pendingLanguages: string[] = [];
  let bufferingLanguage = false;

  const updateCurrentLang = (language: string): boolean => {
    const ui = resumeStore.currentUI;
    if (!ui || !RESUME_LANG_CODES.includes(language)) return false;
    ui.language = language;
    return true;
  };
  // 翻译完成前缓冲语言更新，成功回复后才写入简历 ui
  const bufferedUpdateLanguage = (language: string): boolean => {
    if (!RESUME_LANG_CODES.includes(language)) return false;
    if (!bufferingLanguage) return updateCurrentLang(language);
    pendingLanguages.push(language);
    return true;
  };

  // 请求成功：语义操作整批写入，语言更新在内容提交后执行
  const commitDeferredWrites = () => {
    bufferingLanguage = false;
    const result = operationBuffer.commit();
    const languages = pendingLanguages.splice(0);
    languages.forEach(updateCurrentLang);
    return result.applied || languages.length > 0;
  };

  // 请求取消/失败：丢弃缓冲，避免留下半截新增或修改
  const discardDeferredWrites = () => {
    bufferingLanguage = false;
    pendingLanguages.length = 0;
    operationBuffer.discard();
  };

  // 请求配置：技能工具、简历工具与请求上下文统一在此装配
  const config: AssistantConfig = {
    generating: isGenerating,
    // 反思口径由简历域提供：仅检查冲突与格式，不做扩写，避免把提问等交互内容当成答案精炼
    reflectPrompt:
      "请检查上一条内容：若与用户任务冲突或格式被破坏，只输出修正后的完整内容；否则逐字原样输出。禁止输出任何解释、理解过程、思考、说明、标题或额外新增内容；若上一条内容本身是提问或交互内容，保持原样，不得拆分或补充新问题。",
    // 工具名未注册属可恢复错误：返回错误与可用工具清单让模型重调；其它执行错误保持中断
    onToolError: ({ toolCall, error, tools }) => {
      if (error instanceof ToolNotFoundError) {
        return { error: error.message, guide: buildToolGuide(tools) };
      }
      return undefined;
    },
    tools: [
      // 按需技能注册为只读工具，需要时由模型调用获取全文
      ...createSkillTools(onDemandSkills.map((createSkill) => createSkill())),
      ...createResumeTools({
        getResumeData: resumeContext.getResumeData,
        applyResumeOperations: operationBuffer.execute,
        updateLanguage: bufferedUpdateLanguage,
      }),
    ],
    beforeRequest: () => {
      bufferingLanguage = true;
      operationBuffer.begin();
      resumeContext.beforeRequest();
    },
    afterRequest: resumeContext.afterRequest,
    commitDeferredWrites,
    discardDeferredWrites,
  };

  // 创建对话：常驻技能按清单顺序作为系统消息注入
  const createChat = () => {
    const resident = residentSkills.map((createSkill) => createSkill());
    const [first, ...rest] = resident;
    const newChat = createDefaultChat({
      ...createDefaultMessage(),
      role: "system",
      content: first.instructions,
      typing: false,
    });
    rest.forEach((skill) => {
      newChat.messages.push({
        ...createDefaultMessage(),
        role: "system",
        content: skill.instructions,
        typing: false,
      });
    });
    return newChat;
  };

  return { config, createChat };
};
