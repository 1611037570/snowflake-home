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

  // 写操作缓冲：生成期间工具先不落数据/草稿，成功回复后再统一应用，避免中间状态暴露给用户
  const realApplyDiff = applyDiff ?? (() => []);
  const pendingWrites: Array<
    | { type: "diff"; patch: Record<string, any> }
    | { type: "add"; module: string }
  > = [];
  const pendingAddCount: Record<string, number> = {};
  let bufferingWrites = false;

  const bufferedApplyDiff = (patch: Record<string, any>): string[] => {
    if (bufferingWrites) {
      pendingWrites.push({ type: "diff", patch });
      return [];
    }
    return realApplyDiff(patch);
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

  // 请求成功：按调用顺序把缓冲操作真实落库（新增记录、diff 草稿）
  const commitDeferredWrites = () => {
    bufferingWrites = false;
    Object.keys(pendingAddCount).forEach((key) => delete pendingAddCount[key]);
    const writes = pendingWrites.splice(0);
    writes.forEach((item) => {
      if (item.type === "add") addDataRecord?.(item.module);
      else realApplyDiff(item.patch);
    });
  };

  // 请求取消/失败：丢弃缓冲，避免留下半截新增或草稿
  const discardDeferredWrites = () => {
    bufferingWrites = false;
    pendingWrites.length = 0;
    Object.keys(pendingAddCount).forEach((key) => delete pendingAddCount[key]);
  };

  // 请求前备份：只备份 AI 可能改动的 data/config/fixedConfig
  const captureBackup = () => {
    const item = resumeStore.currentItem;
    if (!item) return null;
    return {
      data: JSON.parse(JSON.stringify(item.data ?? {})),
      config: JSON.parse(JSON.stringify(item.config ?? {})),
      fixedConfig: JSON.parse(JSON.stringify(item.fixedConfig ?? {})),
    };
  };

  // 撤回修改：用请求前备份覆盖当前简历数据
  const restoreBackup = (backup: any) => {
    const item = resumeStore.currentItem;
    if (!item || !backup) return;
    item.data = backup.data ?? {};
    item.config = backup.config ?? {};
    item.fixedConfig = backup.fixedConfig ?? {};
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
        applyDiff: bufferedApplyDiff,
      }),
    ],
    beforeRequest: () => {
      bufferingWrites = true;
      resumeContext.beforeRequest();
    },
    afterRequest: resumeContext.afterRequest,
    commitDeferredWrites,
    discardDeferredWrites,
    captureBackup,
    restoreBackup,
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
