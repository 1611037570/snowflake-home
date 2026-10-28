import type { ContentAiAction } from "@snowflake/resume-agent";

// 按钮与结果标题共用文案映射，操作语义由 AI 层负责。
export const CONTENT_AI_LABELS: Record<ContentAiAction, string> = {
  generate: "resumeContentGenerate", // 生成正文。
  continue: "resumeContentContinue", // 接续原文。
  polish: "resumeContentPolish", // 更专业。
  simplify: "resumeContentSimplify", // 更凝练。
  expand: "resumeContentExpand", // 更详细。
};

// 富文本仅声明功能分组与图标，不定义提示词或模型调用逻辑。
export const CONTENT_AI_GROUPS: Array<{
  // 分组标题的国际化文案键。
  label: string;
  // 当前分组提供的正文操作。
  actions: Array<{
    // 传给通用正文能力的操作标识。
    action: ContentAiAction;
    // 已在项目图标表登记的图标。
    icon: string;
  }>;
}> = [
  {
    label: "resumeContentAiGenerate",
    actions: [
      { action: "generate", icon: "lucide:file-text" },
      { action: "continue", icon: "lucide:pencil" },
    ],
  },
  {
    label: "resumeContentAiRewrite",
    actions: [
      { action: "polish", icon: "lucide:briefcase" },
      { action: "simplify", icon: "ph:lightning-duotone" },
      { action: "expand", icon: "lucide:expand" },
    ],
  },
];
