import assert from "node:assert/strict";
import { test } from "node:test";
import { LLM } from "../dist/index.js";

// 校验内置调度器通过请求接口完成工具调用并继续生成答案。
test("执行工具后继续模型请求", async () => {
  const llm = new LLM({
    url: "https://example.com/chat",
    provider: "openai",
    apiKey: "key",
    model: "test-model",
  });
  const requests = [];
  let callCount = 0;
  llm.request = async (config) => ({
    abortFn: () => {},
    sendFn: async () => {
      requests.push(config.options.messages);
      if (callCount++ === 0) {
        config.onEvent("tool_call_delta", {
          index: 0,
          id: "call-1",
          type: "function",
          function: { name: "echo", arguments: '{"text":"你好"}' },
        });
      } else {
        config.onEvent("content", "完成");
      }
    },
  });

  const executed = [];
  const runner = llm.react({
    tools: [
      {
        name: "echo",
        description: "返回输入",
        parameters: { type: "object" },
        execute: (args) => {
          executed.push(args);
          return args.text;
        },
      },
    ],
    maxSteps: 2,
  });

  const answer = await runner.run([{ role: "user", content: "开始" }]);
  assert.equal(answer, "完成");
  assert.deepEqual(executed, [{ text: "你好" }]);
  assert.deepEqual(requests[1].at(-1), {
    role: "tool",
    content: '"你好"',
    tool_call_id: "call-1",
  });
});
