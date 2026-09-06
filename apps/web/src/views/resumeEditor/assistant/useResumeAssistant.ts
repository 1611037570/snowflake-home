import { useAiStore, useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { onDemandSkills, residentSkills } from "./skills/registry";
import { createSkillTools } from "./skills/skillTools";
import { useResumeContext } from "./resumeContext";
import { createResumeTools } from "./resumeTools";
import type { AssistantConfig } from "./types";

// 简历助手唯一组装器：入口只消费本模块产出的 config 与创建对话方法
export const useResumeAssistant = (
  applyDataPatch?: (patch: Record<string, any>) => string[],
  addDataRecord?: (moduleKey: string) => number,
) => {
  const aiStore = useAiStore();
  const resumeStore = useResumeStore();
  const { isGenerating } = storeToRefs(resumeStore);
  const { createDefaultChat, createDefaultMessage } = aiStore;
  const resumeContext = useResumeContext();

  // 写操作缓冲：生成期间工具先不落数据，成功回复后再统一写入，避免中间状态暴露给用户
  const realApplyDataPatch = applyDataPatch ?? (() => []);
  const pendingWrites: Array<
    | { type: "patch"; patch: Record<string, any> }
    | { type: "add"; module: string }
  > = [];
  const pendingAddCount: Record<string, number> = {};
  let bufferingWrites = false;

  const bufferedApplyPatch = (patch: Record<string, any>): string[] => {
    if (bufferingWrites) {
      pendingWrites.push({ type: "patch", patch });
      return [];
    }
    return realApplyDataPatch(patch);
  };

  const bufferedAddRecord = (moduleKey: string): number => {
    if (!bufferingWrites) return addDataRecord?.(moduleKey) ?? -1;
    const view = resumeContext.getResumeData(moduleKey)?.[moduleKey] as
      | { data?: unknown }
      | undefined;
    if (!view || !Array.isArray(view.data)) return -1;
    const index = view.data.length + (pendingAddCount[moduleKey] ?? 0);
    pendingAddCount[moduleKey] = (pendingAddCount[moduleKey] ?? 0) + 1;
    pendingWrites.push({ type: "add", module: moduleKey });
    return index;
  };

  // 请求成功：按调用顺序把缓冲操作真实写入（新增记录、字段补丁）；返回是否真实写入过
  const commitDeferredWrites = () => {
    bufferingWrites = false;
    Object.keys(pendingAddCount).forEach((key) => delete pendingAddCount[key]);
    const writes = pendingWrites.splice(0);
    writes.forEach((item) => {
      if (item.type === "add") addDataRecord?.(item.module);
      else realApplyDataPatch(item.patch);
    });
    return writes.length > 0;
  };

  // 请求取消/失败：丢弃缓冲，避免留下半截新增或修改
  const discardDeferredWrites = () => {
    bufferingWrites = false;
    pendingWrites.length = 0;
    Object.keys(pendingAddCount).forEach((key) => delete pendingAddCount[key]);
  };

  // 请求配置：技能工具、简历工具与请求上下文统一在此装配
  const config: AssistantConfig = {
    generating: isGenerating,
    tools: [
      // 按需技能注册为只读工具，需要时由模型调用获取全文
      ...createSkillTools(onDemandSkills.map((createSkill) => createSkill())),
      ...createResumeTools({
        getResumeData: resumeContext.getResumeData,
        addDataRecord: bufferedAddRecord,
        applyPatch: bufferedApplyPatch,
      }),
    ],
    beforeRequest: () => {
      bufferingWrites = true;
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
