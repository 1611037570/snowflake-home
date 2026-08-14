import { useLocalStorage } from "@vueuse/core";

export const useAiSettings = () => {
  return useLocalStorage("sf-ai-settings", {
    model: "gpt-3.5-turbo",
    historyCount: 10,
    contextLength: 4000,
    temperature: 0.7,
    systemPrompt: "你好！我是 AI 助手，有什么我可以帮你的吗？",
    webSearch: false,
    thinkMode: "fast",
  });
};
