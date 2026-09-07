import type { SkillFactory } from "../types";
import { defaultPrompt } from "./defaultPrompt";
import { greeting } from "./greeting";
import { jobMatch } from "./jobMatch";
import { jdOptimize } from "./jdOptimize";
import { resumeCreate } from "./resumeCreate";
import { resumeDataContract } from "./resumeDataContract";
import { resumeOptimization } from "./resumeOptimization";
import { resumeOptimizeTask } from "./resumeOptimizeTask";
import { resumeTranslate } from "./resumeTranslate";
import { resumeWriting } from "./resumeWriting";
import { selfIntro } from "./selfIntro";

// 常驻技能：按顺序作为系统消息注入对话
export const residentSkills: SkillFactory[] = [defaultPrompt];

// 按需技能：注册为只读工具，模型需要时调用读取全文
export const onDemandSkills: SkillFactory[] = [
  resumeDataContract,
  resumeWriting,
  resumeOptimization,
  jobMatch,
  jdOptimize,
  greeting,
  resumeOptimizeTask,
  resumeCreate,
  resumeTranslate,
  selfIntro,
];
