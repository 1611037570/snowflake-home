import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareContext } from "../dist/index.js";

const countTokens = (messages) => messages.reduce((total, message) => total + (message.content?.length || 0), 0);
const summarize = () => "摘要";

// 压缩只作用于发送副本，系统指令与最近的问题仍完整保留。
test("压缩旧对话并保留当前消息", async () => {
  const messages = [
    { role: "system", content: "系统指令" },
    { role: "user", content: "很长的旧问题内容" },
    { role: "assistant", content: "很长的旧回答内容" },
    { role: "user", content: "当前问题" },
  ];
  const compacted = await prepareContext(messages, { maxInputTokens: 20, countTokens, summarize });
  assert.equal(messages.length, 4);
  assert.equal(compacted[0], messages[0]);
  assert.equal(compacted.at(-1), messages.at(-1));
  assert.equal(compacted[1].content, "此前对话摘要：\n摘要");
  assert.ok(countTokens(compacted) <= 20);
});

// 工具调用和工具结果必须一起进入摘要，避免发送孤立的协议消息。
test("工具调用与结果作为整体压缩", async () => {
  const toolCall = { id: "call-1", type: "function", function: { name: "echo", arguments: "{}" } };
  const messages = [
    { role: "user", content: "当前问题" },
    { role: "assistant", content: null, tool_calls: [toolCall] },
    { role: "tool", content: "很长的工具输出内容很多很多很多", tool_call_id: "call-1" },
    { role: "assistant", content: null, tool_calls: [toolCall] },
    { role: "tool", content: "最近的工具输出", tool_call_id: "call-1" },
  ];
  const removed = [];
  const compacted = await prepareContext(messages, {
    maxInputTokens: 22,
    countTokens,
    summarize: (part) => {
      removed.push(...part);
      return "摘要";
    },
  });
  assert.deepEqual(removed, messages.slice(1, 3));
  assert.deepEqual(compacted.slice(-2), messages.slice(-2));
  assert.ok(countTokens(compacted) <= 22);
});

// 当前消息本身超出预算时明确报错，不丢弃用户输入。
test("没有可压缩历史时拒绝静默裁剪", async () => {
  await assert.rejects(
    prepareContext([{ role: "user", content: "当前问题很长" }], { maxInputTokens: 2, countTokens, summarize }),
    /没有可压缩的旧消息/,
  );
});
