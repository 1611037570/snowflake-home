import { useAiStore, useResumeStore } from "@/stores";
import { ToolNotFoundError } from "@/apis";
import { storeToRefs } from "pinia";
import { buildToolGuide } from "./toolGuide";
import { onDemandSkills, residentSkills } from "./skills/registry";
import { createSkillTools } from "./skills/skillTools";
import { useResumeContext } from "./resumeContext";
import { createResumeTools, RESUME_LANG_CODES } from "./resumeTools";
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
    | { type: "delete"; module: string; index: number }
    | { type: "move"; module: string; from: number; to: number }
    | { type: "lang"; language: string }
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

  const bufferedRemoveRecord = (moduleKey: string, index: number): boolean => {
    if (!bufferingWrites) return resumeStore.removeDataRecord(moduleKey, index);
    pendingWrites.push({ type: "delete", module: moduleKey, index });
    return true;
  };

  const bufferedMoveRecord = (moduleKey: string, from: number, to: number): boolean => {
    if (!bufferingWrites) return resumeStore.moveDataRecord(moduleKey, from, to);
    pendingWrites.push({ type: "move", module: moduleKey, from, to });
    return true;
  };

  const updateCurrentLang = (language: string): boolean => {
    const ui = resumeStore.currentUI;
    if (!ui || !RESUME_LANG_CODES.includes(language)) return false;
    ui.language = language;
    return true;
  };
  // 翻译完成前缓冲语言更新，成功回复后才写入简历 ui
  const bufferedUpdateLanguage = (language: string): boolean => {
    if (!RESUME_LANG_CODES.includes(language)) return false;
    if (!bufferingWrites) return updateCurrentLang(language);
    pendingWrites.push({ type: "lang", language });
    return true;
  };

  // 请求成功：按调用顺序把缓冲操作真实写入（新增记录、字段补丁）；返回是否真实写入过
  const commitDeferredWrites = () => {
    bufferingWrites = false;
    Object.keys(pendingAddCount).forEach((key) => delete pendingAddCount[key]);
    const writes = pendingWrites.splice(0);
    writes.forEach((item) => {
      if (item.type === "add") addDataRecord?.(item.module);
      else if (item.type === "delete") resumeStore.removeDataRecord(item.module, item.index);
      else if (item.type === "move") resumeStore.moveDataRecord(item.module, item.from, item.to);
      else if (item.type === "lang") updateCurrentLang(item.language);
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
        addDataRecord: bufferedAddRecord,
        removeDataRecord: bufferedRemoveRecord,
        moveDataRecord: bufferedMoveRecord,
        applyPatch: bufferedApplyPatch,
        updateLanguage: bufferedUpdateLanguage,
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
