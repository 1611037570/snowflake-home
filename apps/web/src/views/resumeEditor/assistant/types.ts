// AI 助手宿主配置类型：技能与工具由调用方提供，chat 引擎不内置业务内容
import type { ReactConfig, ReactTool } from "@/apis/llm/react";
import type { Ref } from "vue";

// 一份外部投递的技能：name/description 供调度识别，instructions 为技能正文
export interface Skill {
  id: string;
  name: string;
  description: string;
  instructions: string;
}

// 技能工厂：每个技能文件导出一个无参函数，返回统一 Skill 结构
export type SkillFactory = () => Skill;

// 引导流程步骤：预设询问或自由输入；options 为函数时在步骤展示前求值（如按当前简历动态生成）
export type FlowStep = {
  question: string;
  options: string[] | (() => string[]);
  input?: boolean;
  // 条件步骤仅在满足业务条件时加入本次引导流程
  when?: () => boolean;
  // 命中取消答案时结束流程，不触发 AI 请求
  cancelAnswers?: string[];
  cancelMessage?: string;
  collectAnswer?: boolean;
};

// 引导流程：点击建议卡片后先收集信息，再构造真实请求
export type Flow = {
  userContent: string;
  steps: FlowStep[];
  build: (answers: string[]) => {
    prompt?: string;
    userContent: string;
    requestContext?: Record<string, unknown>;
  };
};

// 建议卡片：由调用方注入，Chat 只负责展示与转发
export type SuggestCard = {
  icon: string;
  title: string;
  flow: string;
  // 功能分类用于保持简历编辑入口简洁，并为面试模块独立展示预留边界
  category: "resume" | "interview";
  // 功能介绍用于建议卡片启动前展示能力、耗时与适用场景
  intro?: {
    badge?: string;
    duration: string;
    description: string;
    features: string[];
    scene: string;
    action: string;
  };
};

// 宿主组装后传给 chat 的配置，技能与工具均由调用方传入
export interface AssistantConfig {
  // 请求期间置为 true 的生成状态
  generating: Ref<boolean>;
  // ReAct 可用工具
  tools: ReactTool[];
  // 反思轮提示词：反思口径由宿主按业务提供，请求引擎不内置
  reflectPrompt: string;
  // 工具执行错误回调：由宿主决定恢复或中断，引擎只负责转交
  onToolError?: ReactConfig["onToolError"];
  // 请求前准备（如裁剪头像），与 afterRequest 成对使用
  beforeRequest?: (context?: Record<string, unknown>) => void;
  // 请求结束后还原现场
  afterRequest?: () => void;
}
