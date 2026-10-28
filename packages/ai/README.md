# 通用 AI 基础包

本包维护模型请求、流式解析、上下文编排和工具循环，不依赖简历、Web 组件或状态管理。

- `src/request/providers.ts` 集中处理服务商兼容差异。Gemini、Claude、千问使用官方 OpenAI Chat Completions 兼容入口，豆包使用火山方舟的聊天接口；新增服务商仍复用现有协议、传输和解析能力。
- Gemini 的通用思考开关映射为 `reasoning_effort`，不能关闭思考的模型以低思考量运行；千问映射为 `enable_thinking`。Claude 兼容入口采用模型默认思考策略，不把简化的开关当作完整原生思考配置发送。
- Claude 使用自主工具选择，兼容不支持强制工具调用的模型；浏览器访问官方地址时附加官方 SDK 使用的访问声明。调用方需使用业务空间内创建的 API Key。
- 工具调用上的 `extra_content` 元数据会随历史回传，保留 Gemini 多轮工具调用需要的思考签名。
- 服务商预设、密钥和模型选择由宿主提供；模型能力、权限和跨域访问仍受对应服务商及账号配置限制。

接口依据：[Gemini 兼容接口](https://ai.google.dev/gemini-api/docs/openai)、[Gemini 思考签名](https://ai.google.dev/gemini-api/docs/generate-content/thought-signatures)、[Claude 兼容接口](https://platform.claude.com/docs/en/cli-sdks-libraries/libraries/openai-sdk)、[千问兼容接口](https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope)。
