import { executeToolCall } from "./actor";
import { observe } from "./observer";
import { think } from "./thinker";
import { ToolRegistry } from "./tools";
import type { ChatMessage, ReactConfig } from "./types";

/**
 * ReAct 循环编排器：思考 -> 执行 -> 观察，直到模型给出最终答案或超过最大步数
 */
export class ReactRunner {
  private aborted = false;
  private abortRef: { current: (() => void) | null } = { current: null };
  private registry: ToolRegistry;

  constructor(private config: ReactConfig) {
    this.registry = new ToolRegistry();
    this.config.tools.forEach((t) => this.registry.register(t));
  }

  // 中止当前进行中的请求与循环
  abort() {
    this.aborted = true;
    this.abortRef.current?.();
  }

  async run(initialMessages: ChatMessage[]): Promise<string> {
    const maxSteps = this.config.maxSteps ?? 6;
    const history: ChatMessage[] = [...initialMessages];

    for (let step = 0; step < maxSteps; step++) {
      if (this.aborted) throw new Error("已中止");

      const llm = this.config.getLLM();
      const result = await think(llm, history, {
        tools: this.config.tools,
        model: this.config.model,
        abortRef: this.abortRef,
      });

      if (this.aborted) throw new Error("已中止");

      console.log(
        "[ReAct] 第",
        step + 1,
        "步思考，工具调用:",
        result.toolCalls.map((t) => t.function.name),
      );

      this.config.onThink?.(result.reasoning);

      // 无工具调用表示已给出最终答案
      if (!result.toolCalls.length) {
        console.log("[ReAct] 最终答案:", result.finalAnswer);
        this.config.onFinal?.(result.finalAnswer);
        return result.finalAnswer;
      }

      // 回填 assistant 的工具调用消息
      history.push({
        role: "assistant",
        content: null,
        tool_calls: result.toolCalls,
      });

      for (const toolCall of result.toolCalls) {
        if (this.aborted) throw new Error("已中止");

        console.log("[ReAct] 执行工具:", toolCall.function.name, toolCall.function.arguments);
        this.config.onAct?.(toolCall);
        const raw = await executeToolCall(this.registry, toolCall);
        const observation = observe(toolCall, raw);
        console.log("[ReAct] 观察结果:", observation.content);
        this.config.onObserve?.(observation);

        history.push({
          role: "tool",
          content: observation.content,
          tool_call_id: observation.toolCallId,
        });
      }
    }

    throw new Error("ReAct 超出最大步数");
  }
}
