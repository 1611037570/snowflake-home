import { useAiStore, useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { onDemandSkills, residentSkills } from "./skills/registry";
import { createSkillTools } from "./skills/skillTools";
import { useResumeContext } from "./resumeContext";
import { createResumeTools } from "./resumeTools";
import type { AssistantConfig } from "./types";

// 简历助手唯一组装器：入口只消费本模块产出的 config 与创建对话方法
export const useResumeAssistant = (
  applyDiff?: (patch: Record<string, any>) => string[],
  addDataRecord?: (moduleKey: string) => number,
) => {
  const aiStore = useAiStore();
  const resumeStore = useResumeStore();
  const { isGenerating } = storeToRefs(resumeStore);
  const { createDefaultChat, createDefaultMessage } = aiStore;
  const resumeContext = useResumeContext();

  // 请求配置：技能工具、简历工具与请求上下文统一在此装配
  const config: AssistantConfig = {
    generating: isGenerating,
    tools: [
      // 按需技能注册为只读工具，需要时由模型调用获取全文
      ...createSkillTools(onDemandSkills.map((createSkill) => createSkill())),
      ...createResumeTools({
        getResumeData: resumeContext.getResumeData,
        addDataRecord,
        applyDiff: applyDiff ?? (() => []),
      }),
    ],
    applyResult: (data) => applyDiff?.(data),
    beforeRequest: resumeContext.beforeRequest,
    afterRequest: resumeContext.afterRequest,
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
