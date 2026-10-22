# resume assistant 目录说明

本目录只负责简历助手的路由、流程和会话展示，不保存 AI 请求、技能正文、字段契约或工具实现。

```text
editor/panel/index.vue（异步挂载助手）
  → chat/index.vue（会话与引导宿主）
       → flows / interview（建议卡片与交互流程）
       → routing/registry（登记按需 AI 能力）
       → useResumeAssistant（装配本轮工具与简历上下文）
       → chat/useChatRequest（接入任务运行时、维护会话状态与撤回）
            → packages/resume-agent（同一 ReAct 建立任务契约、执行工具并核对完成证据）
```

目录职责：

- `chat/`：维护会话消息、输入、生成状态、撤回入口和展示组件。
- `flows.ts`：维护助手功能入口、引导步骤和请求上下文。
- `interview/`：维护面试流程、入口判断和建议卡片，不保存面试技能正文。
- `routing/registry.ts`：登记常驻提示、任务能力与参考知识的按需加载关系。
- `routing/defaultPrompt.ts`：维护助手共用的读取、写入与事实边界。
- `useResumeAssistant.ts`：根据当前简历状态装配 `packages/resume-agent` 提供的上下文、工具与错误引导。

依赖约定：

- 助手可以调用 `packages/resume-agent`，`packages/resume-agent` 不得依赖助手。
- 新增技能、提示词、请求任务、工具、字段契约或报告解析时写入 `packages/resume-agent`。
- 新增功能入口、引导步骤、技能选择关系或会话交互时写入本目录。
- 页面不得直接创建模型请求，统一调用 `@snowflake/resume-agent` 的公开出口。
