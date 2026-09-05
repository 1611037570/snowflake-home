// AI 助手宿主配置类型：技能与工具由调用方提供，chat 引擎不内置业务内容
import type { ReactTool } from "@/apis/llm/react";
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

// 引导流程步骤：预设询问或自由输入
export type FlowStep = {
  question: string;
  options: string[];
  input?: boolean;
};

// 引导流程：点击建议卡片后先收集信息，再构造真实请求
export type Flow = {
  userContent: string;
  steps: FlowStep[];
  build: (answers: string[]) => { prompt?: string; userContent: string };
};

// 建议卡片：由调用方注入，Chat 只负责展示与转发
export type SuggestCard = {
  icon: string;
  title: string;
  flow: string;
};

// 宿主组装后传给 chat 的配置，技能与工具均由调用方传入
export interface AssistantConfig {
  // 请求期间置为 true 的生成状态
  generating: Ref<boolean>;
  // ReAct 可用工具
  tools: ReactTool[];
  // 普通流解析结果应用回调（如将模型返回的 data 写入预览草稿）
  applyResult?: (data: any) => void;
  // 请求前准备（如裁剪头像），与 afterRequest 成对使用
  beforeRequest?: () => void;
  // 请求结束后还原现场
  afterRequest?: () => void;
}
