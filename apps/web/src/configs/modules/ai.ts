export const snowflake = {
  // 旧版本：本地后端中转
  // baseUrl: "http://localhost:3000/llm/stream",
  // 线上版本：方舟 Chat Completions
  // baseUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
  baseUrl: "https://api.deepseek.com/chat/completions",
  provider: "openai",
  // apiKey: "c15973e5-8397-422f-9c86-a12df469d452",
  apiKey: "sk-b296024c9bf14e189ef53d07571b56f0",
  // model: "deepseek-v4-flash-ga-260731",
  model: "deepseek-v4-flash",
};
