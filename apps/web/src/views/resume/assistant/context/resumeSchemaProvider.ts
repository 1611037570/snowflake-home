import {
  configureResumeMediaFields,
  configureResumeSchema,
} from "@snowflake/resume-agent/host";
import { allConfig } from "@/stores/modules/resume/config/formConfig";
import { RESUME_VALUE_OPTIONS } from "@/stores/modules/resume/config/resumeOptions";
import { RESUME_MEDIA_FIELDS } from "@/stores/modules/resume/config/mediaFields";
import { buildResumeSchema } from "./resumeSchemaSource";

// 从 Web 表单配置生成简历 Agent 使用的字段契约。
export const registerResumeAgentSchema = () => {
  // 表单 DSL 只在 Web 侧解析，领域包只接收已经生成的简历 Schema。
  configureResumeSchema(
    buildResumeSchema(
      Object.entries(allConfig).map(([key, schema]) => ({ key, schema })),
      RESUME_VALUE_OPTIONS,
    ),
  );
  // 媒体字段沿用简历 Store 的唯一声明，供 Agent 统一禁止读写。
  configureResumeMediaFields(
    RESUME_MEDIA_FIELDS.map(({ moduleKey, field }) => ({ moduleKey, field })),
  );
};
