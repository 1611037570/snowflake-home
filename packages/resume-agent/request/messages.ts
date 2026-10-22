// 简历 AI 请求层使用的稳定文案标识。
export type ResumeAiMessageKey =
  | "aborted"
  | "streamNoRetry"
  | "modelUnset"
  | "truncated"
  | "emptyGeneration"
  | "emptyAnswer"
  | "markdownModelMissing"
  | "pdfModelUnset"
  | "requestTooLarge";

// 宿主提供的界面文案能力，领域包不依赖具体国际化实现。
export interface ResumeAiMessageProvider {
  // 根据稳定标识与插值参数返回当前语言的文案。
  translate: (key: ResumeAiMessageKey, params?: Record<string, unknown>) => string;
}

const DEFAULT_MESSAGES: Record<ResumeAiMessageKey, string> = {
  aborted: "已取消 AI 请求",
  streamNoRetry: "流式 AI 请求不支持自动重试",
  modelUnset: "请先配置并选择 AI 模型",
  truncated: "AI 返回内容不完整，请重试",
  emptyGeneration: "AI 未生成可用的简历数据",
  emptyAnswer: "模型未返回回答内容",
  markdownModelMissing: "请先配置简历导入模型",
  pdfModelUnset: "请先配置支持图片识别的简历解析模型",
  requestTooLarge: "简历文件过大，请压缩至 {size} MB 以内",
};

let messageProvider: ResumeAiMessageProvider | undefined;

// 注册宿主文案提供者，未注册时使用领域包内的中文默认文案。
export const configureResumeAiMessageProvider = (provider: ResumeAiMessageProvider) => {
  messageProvider = provider;
};

// 读取请求文案，宿主返回空值时回退到默认文案并完成简单插值。
export const getResumeAiMessage = (
  key: ResumeAiMessageKey,
  params: Record<string, unknown> = {},
) => {
  const translated = messageProvider?.translate(key, params);
  const template = translated || DEFAULT_MESSAGES[key];
  // 目标 lib 未提供 replaceAll，用拆分再拼接完成同名占位符替换
  return Object.entries(params).reduce(
    (text, [name, value]) => text.split(`{${name}}`).join(String(value)),
    template,
  );
};
