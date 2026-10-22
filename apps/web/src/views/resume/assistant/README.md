# resume assistant 目录说明

本目录只负责简历助手的路由、流程和会话展示，不保存 AI 请求、技能正文、字段契约或工具实现。

```text
editor/panel/index.vue（异步挂载助手）
  → chat/index.vue（会话与引导宿主）
       → flows / interview（建议卡片与交互流程）
       → routing/registry（登记按需 AI 能力）
       → useResumeAssistant（装配本轮工具与简历上下文）
       → chat/useChatRequest（维护会话展示、取消与撤回）
            → packages/resume-agent（统一会话内建立任务契约、装配工具、执行 ReAct 并核对完成证据）
```

目录职责：

- `chat/`：维护会话消息、输入、生成状态、撤回入口和展示组件；写入状态直接消费运行时结构化证据。
- `flows.ts`：维护助手功能入口、引导步骤和请求上下文。
- `interview/`：维护面试流程、入口判断和建议卡片，不保存面试技能正文。
- `context/`：适配 Web 表单、Store 与简历 Agent；生成字段契约并在请求周期内冻结模块选择、脱敏和读取范围。
- `routing/registry.ts`：登记常驻提示，并复用简历智能体包提供的轻量任务能力与参考知识目录。
- `routing/defaultPrompt.ts`：维护助手共用的读取、写入与事实边界。
- `useResumeAssistant.ts`：根据当前简历状态装配 Web 数据上下文、简历 Agent 工具与错误引导。

依赖约定：

- 助手可以调用 `packages/resume-agent`，`packages/resume-agent` 不得依赖助手。
- 新增技能、提示词、请求任务、工具、字段契约或报告解析时写入 `packages/resume-agent`。
- 新增功能入口、引导步骤、技能选择关系或会话交互时写入本目录。
- 页面不得直接创建模型请求，统一调用 `@snowflake/resume-agent` 的公开出口。
- 应用启动时通过宿主注册器注入模型选择、国际化文案、字段契约与媒体声明，简历 Agent 不反向读取 Web 实现。
