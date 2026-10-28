import { DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/config/defaultConfig";

export type LearningCategoryKey = "start" | "edit" | "writing" | "layout" | "ai" | "export";

export interface LearningCategory {
  /** 学习分类标识，同时对应分类文案。 */
  key: LearningCategoryKey;
  /** 已登记的分类图标。 */
  icon: string;
}

export interface LearningArticle {
  /** 文章标识，同时对应操作指引文案。 */
  id: string;
  /** 文章所属分类。 */
  category: LearningCategoryKey;
  /** 写作指南复用的模块标识，操作指引不设置。 */
  moduleKey?: string;
}

export interface LearningQuestion {
  /** 常见问题标题。 */
  title: string;
  /** 已有模块帮助中的解答。 */
  answer: string;
}

export interface LearningArticleContent extends LearningArticle {
  /** 当前界面语言下的文章标题。 */
  title: string;
  /** 文章摘要与操作说明。 */
  summary: string;
  /** 按实际操作顺序排列的步骤。 */
  steps: string[];
  /** 与当前功能限制相关的提示。 */
  tip: string;
  /** 模块写作复用的常见问答。 */
  questions: LearningQuestion[];
}

// 按实际制作流程组织分类，写作内容复用模块帮助，避免维护两份说明。
export const LEARNING_CATEGORIES: LearningCategory[] = [
  { key: "start", icon: "mdi:book-open-page-variant" },
  { key: "edit", icon: "lucide:file-text" },
  { key: "writing", icon: "lucide:pencil" },
  { key: "layout", icon: "lucide:layout-template" },
  { key: "ai", icon: "lucide:sparkles" },
  { key: "export", icon: "fa6-solid:file-export" },
];

export const LEARNING_ARTICLES: LearningArticle[] = [
  { id: "workspace", category: "start" },
  { id: "import", category: "start" },
  { id: "modules", category: "edit" },
  { id: "fields", category: "edit" },
  { id: "records", category: "edit" },
  { id: "checks", category: "edit" },
  ...[...DEFAULT_MODULE_NAMES.map((module) => module.key), "custom"].map((moduleKey) => ({
    id: `writing_${moduleKey}`,
    category: "writing" as const,
    moduleKey,
  })),
  { id: "style", category: "layout" },
  { id: "spacing", category: "layout" },
  { id: "preview", category: "layout" },
  { id: "assistant", category: "ai" },
  { id: "contentAi", category: "ai" },
  { id: "save", category: "export" },
  { id: "export", category: "export" },
  { id: "privacy", category: "export" },
];
