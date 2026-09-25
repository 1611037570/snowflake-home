import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiError, createRequest, LLM } from "../dist/index.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// 校验分片流在包内解析并向调用方交付内容、思考与用量。
test("解析跨分片的模型流", async () => {
  const encoder = new TextEncoder();
  const chunks = [
    'data: {"choices":[{"delta":{"reasoning_content":"思考","content":"回',
    '答"}}]}\n\ndata: {"choices":[{"delta":{}}],"usage":{"total_tokens":7}}\n\n',
  ];
  globalThis.fetch = async () =>
    new Response(
      new ReadableStream({
        start(controller) {
          for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
          controller.close();
        },
      }),
      { status: 200 },
    );

  const events = [];
  const observed = [];
  const request = createRequest("key", true, {
    onRequest: () => observed.push("request"),
    onResponse: (status) => observed.push(status),
    onFirstToken: () => observed.push("first_token"),
  });
  const result = await request.send({
    url: "https://example.com/chat",
    method: "POST",
    data: "{}",
    isJson: false,
    isDebug: false,
    provider: "openai",
    timeout: 1000,
    onEvent: (type, data) => events.push([type, data]),
  });

  assert.deepEqual(result, { result: "回答", usage: 7 });
  assert.deepEqual(observed, ["request", 200, "first_token"]);
  assert.deepEqual(events, [
    ["reasoning", "思考"],
    ["content", "回答"],
    ["total_tokens", 7],
    ["usage", { total_tokens: 7 }],
  ]);
});

// 校验接口错误由独立包转换为可供调用方识别的类型。
test("透传接口状态与错误码", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: { code: "invalid_model", message: "模型不可用" } }), {
      status: 400,
    });

  const request = createRequest("key", false);
  await assert.rejects(
    request.send({
      url: "https://example.com/chat",
      method: "POST",
      data: "{}",
      isDebug: false,
      provider: "openai",
      timeout: 1000,
    }),
    (error) =>
      error instanceof ApiError &&
      error.status === 400 &&
      error.code === "invalid_model",
  );
});

// 校验公开请求接口将三类模型输出从通用事件中分离。
test("分别回调思考、正文与令牌", async () => {
  globalThis.fetch = async () =>
    new Response(
      'data: {"choices":[{"delta":{"reasoning_content":"思考","content":"回答","tool_calls":[{"index":0,"id":"call-1"}]}}],"usage":{"total_tokens":7}}\n\n',
      { status: 200 },
    );

  const llm = new LLM({
    url: "https://example.com/chat",
    provider: "openai",
    apiKey: "key",
    model: "test-model",
  });
  const received = { reasoning: [], content: [], token: [], event: [] };
  const { sendFn } = await llm.request({
    options: { messages: [{ role: "user", content: "你好" }] },
    isJson: false,
    isDebug: false,
    retryCount: 0,
    onReasoning: (delta) => received.reasoning.push(delta),
    onContent: (delta) => received.content.push(delta),
    onToken: (total) => received.token.push(total),
    onEvent: (type, data) => received.event.push([type, data]),
  });
  await sendFn();

  assert.deepEqual(received, {
    reasoning: ["思考"],
    content: ["回答"],
    token: [7],
    event: [["tool_call_delta", { index: 0, id: "call-1" }]],
  });
});
