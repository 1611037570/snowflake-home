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
        config.onReasoning("思考");
        config.onContent("完成");
        config.onToken(5);
      }
    },
  });

  const executed = [];
  const received = { reasoning: [], content: [], token: [], event: [] };
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
    onReasoning: (delta) => received.reasoning.push(delta),
    onContent: (delta) => received.content.push(delta),
    onToken: (total) => received.token.push(total),
    onEvent: (type) => received.event.push(type),
  });

  const answer = await runner.run([{ role: "user", content: "开始" }]);
  assert.equal(answer, "完成");
  assert.deepEqual(executed, [{ text: "你好" }]);
  assert.deepEqual(received, {
    reasoning: ["思考"],
    content: ["完成"],
    token: [5],
    event: ["tool_call_delta"],
  });
  assert.deepEqual(requests[1].at(-1), {
    role: "tool",
    content: '"你好"',
    tool_call_id: "call-1",
  });
});

// ReAct 在模型请求前压缩发送副本，不改变调用方保存的完整对话。
test("按配置压缩 ReAct 的请求历史", async () => {
  const llm = new LLM({ url: "https://example.com/chat", provider: "openai", apiKey: "key", model: "test-model" });
  const messages = [
    { role: "system", content: "系统指令" },
    { role: "user", content: "很长的旧问题内容" },
    { role: "assistant", content: "很长的旧回答内容" },
    { role: "user", content: "当前问题" },
  ];
  let sent;
  llm.request = async (config) => ({
    abortFn: () => {},
    sendFn: async () => {
      sent = config.options.messages;
      config.onContent("完成");
    },
  });
  const compacted = [];
  const runner = llm.react({
    tools: [],
    maxSteps: 1,
    context: {
      maxInputTokens: 20,
      countTokens: (items) => items.reduce((total, item) => total + (item.content?.length || 0), 0),
      summarize: () => "摘要",
      onCompacted: (info) => compacted.push(info),
    },
  });
  assert.equal(await runner.run(messages), "完成");
  assert.equal(messages.length, 4);
  assert.equal(sent.length, 3);
  assert.equal(sent.at(-1), messages.at(-1));
  assert.equal(compacted.length, 1);
});

// 工具结果使下一轮超出预算时，先压缩完整工具消息组再继续推理。
test("工具结果过大时继续 ReAct", async () => {
  const llm = new LLM({ url: "https://example.com/chat", provider: "openai", apiKey: "key", model: "test-model" });
  const sent = [];
  llm.request = async (config) => ({
    abortFn: () => {},
    sendFn: async () => {
      sent.push(config.options.messages);
      if (sent.length === 1) {
        config.onEvent("tool_call_delta", {
          index: 0,
          id: "call-1",
          type: "function",
          function: { name: "echo", arguments: "{}" },
        });
      } else {
        config.onContent("完成");
      }
    },
  });
  const runner = llm.react({
    tools: [{ name: "echo", description: "返回文本", parameters: { type: "object" }, execute: () => "很长的工具输出内容很多很多很多" }],
    maxSteps: 2,
    context: {
      maxInputTokens: 18,
      countTokens: (items) => items.reduce((total, item) => total + (item.content?.length || 0), 0),
      summarize: () => "摘要",
    },
  });
  assert.equal(await runner.run([{ role: "user", content: "当前问题" }]), "完成");
  assert.equal(sent[1].length, 2);
  assert.equal(sent[1][1].content, "此前对话摘要：\n摘要");
});
