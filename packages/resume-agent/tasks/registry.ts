import type { ResumeAgentTaskProfile } from "../runtime/taskTypes";

type ResumeAgentTaskProfileLoader = () => Promise<ResumeAgentTaskProfile>;

const taskProfileLoaders: Record<string, ResumeAgentTaskProfileLoader> = {
  // 点击一键优化时才加载岗位优化与评分任务正文。
  oneKeyOptimize: () => import("./oneKeyOptimize").then((module) => module.ONE_KEY_OPTIMIZE_TASK),
  // 点击一键调整时才加载问题修复任务正文。
  oneKeyAdjust: () => import("./oneKeyAdjust").then((module) => module.ONE_KEY_ADJUST_TASK),
};

// 根据功能入口按需解析专用任务；普通对话不加载任何按钮任务正文。
export const resolveResumeAgentTaskProfile = async (
  source: unknown,
): Promise<ResumeAgentTaskProfile | undefined> => {
  if (typeof source !== "string") return undefined;
  return taskProfileLoaders[source]?.();
};
