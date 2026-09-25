import { LLM as PackageLLM } from "@snowflake/ai";
import type { LlmObserver } from "@snowflake/ai";
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
  constructor(config: ConstructorParameters<typeof PackageLLM>[0]) {
    super({ ...config, observer });
  }
}

export { LLM };
