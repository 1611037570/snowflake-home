// AI 助手宿主配置类型：技能与工具由调用方提供，chat 引擎不内置业务内容
import type { ReactTool } from "@/apis/llm/react";
import type { Ref } from "vue";

// 宿主组装后传给 chat 的配置，技能与工具均由调用方传入
export interface AssistantConfig {
  // 请求期间置为 true 的生成状态
  generating: Ref<boolean>;
  // 技能正文，创建对话时作为系统消息随默认提示一起注入
  skillSystem: string;
  // ReAct 可用工具
  tools: ReactTool[];
  // 普通流解析结果应用回调（如将模型返回的 data 写入预览草稿）
  applyResult?: (data: any) => void;
  // 请求前准备（如裁剪头像），与 afterRequest 成对使用
  beforeRequest?: () => void;
  // 请求结束后还原现场
  afterRequest?: () => void;
  // 加工最后一条用户消息（如拼接简历数据与字段解析）
  buildUserContent?: (content: string) => string;
}
