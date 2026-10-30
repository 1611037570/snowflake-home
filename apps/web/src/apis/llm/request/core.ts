import { LLM as PackageLLM } from "@snowflake/ai";
import type { LlmObserver } from "@snowflake/ai";
import type { AiAgentKey } from "@/stores/modules/ai";
import { startAiUsage, startAiUsageRequest, updateAiUsageTokens, finishAiUsage } from "../usage";
import {
  appendLlmTraceOutput,
  appendLlmTraceReasoning,
  createLlmTrace,
  finishLlmTrace,
  markLlmTraceFirstToken,
  recordLlmTraceEvent,
  setLlmTraceOutput,
  updateLlmTraceStatus,
  updateLlmTraceUsage,
} from "../monitor";

// Web 宿主提供观测实现，独立包只调用通用接口。
const observer: LlmObserver = {
  appendLlmTraceOutput,
  appendLlmTraceReasoning,
  createLlmTrace,
  finishLlmTrace,
  markLlmTraceFirstToken,
  recordLlmTraceEvent,
  setLlmTraceOutput,
  updateLlmTraceStatus,
  updateLlmTraceUsage,
};

// 保留原有 LLM 构造方式，并为 Web 默认接入监控。
class LLM extends PackageLLM {
  constructor(config: ConstructorParameters<typeof PackageLLM>[0] & {
    usageAgent?: AiAgentKey; // 仅业务角色调用记录个人使用情况，连接检测不传入。
  }) {
    const { usageAgent, ...modelConfig } = config;
    // 每个角色实例独立接线，统计不进入智能体业务规则或影响其他角色。
    const scopedObserver: LlmObserver = usageAgent ? {
      ...observer,
      createLlmTrace: (options) => {
        const id = observer.createLlmTrace(options);
        startAiUsage(id, usageAgent, options.model);
        return id;
      }, // 整个工具循环只创建一次调用记录。
      recordLlmTraceEvent: (id, type, data) => {
        observer.recordLlmTraceEvent(id, type, data);
        if (type === "request") startAiUsageRequest(id);
      }, // 用实际网络请求分隔用量快照，不按流式事件重复计算。
      updateLlmTraceUsage: (id, usage) => {
        observer.updateLlmTraceUsage(id, usage);
        updateAiUsageTokens(id, usage);
      }, // 同时接收总量与输入、输出明细。
      setLlmTraceOutput: (id, output) => {
        observer.setLlmTraceOutput(id, output);
        updateAiUsageTokens(id, output);
      }, // 非流式请求从响应中的用量字段读取，不保存正文到使用记录。
      finishLlmTrace: (id, status, error) => {
        observer.finishLlmTrace(id, status, error);
        finishAiUsage(id, status);
      }, // 最终完成后才结算，不把中间请求当成多次服务。
    } : observer;
    super({ ...modelConfig, observer: scopedObserver });
  }
}

export { LLM };
