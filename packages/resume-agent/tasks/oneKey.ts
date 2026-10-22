import type { ResumeAgentTaskProfile } from "../runtime/resumeAgentTask";
import { ONE_KEY_ADJUST_TASK } from "./oneKeyAdjust";
import { ONE_KEY_OPTIMIZE_TASK } from "./oneKeyOptimize";

// 仅根据按钮写入的入口标识解析一键任务，普通对话不会获得任务配置。
export const getOneKeyResumeTaskProfile = (entryFlow: unknown): ResumeAgentTaskProfile | undefined => {
  if (entryFlow === ONE_KEY_ADJUST_TASK.id) return ONE_KEY_ADJUST_TASK;
  if (entryFlow === ONE_KEY_OPTIMIZE_TASK.id) return ONE_KEY_OPTIMIZE_TASK;
  return undefined;
};
