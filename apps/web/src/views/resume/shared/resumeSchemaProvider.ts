import { configureResumeMediaFields, configureResumeSchema } from "@snowflake/resume-core/host";
import { allConfig } from "@/stores/modules/resume/config/formConfig";
import { RESUME_VALUE_OPTIONS } from "@/stores/modules/resume/config/resumeOptions";
import { RESUME_MEDIA_FIELDS } from "@snowflake/resume-core/mediaFields";
import { buildResumeSchema } from "@/views/resume/shared/resumeSchemaSource";

// 从 Web 表单配置生成公共简历字段契约，不依赖任何业务智能体。
export const registerResumeSchema = () => {
  // 表单 DSL 只在 Web 侧解析，领域包只接收已经生成的简历 Schema。
  configureResumeSchema(
    buildResumeSchema(
      Object.entries(allConfig).map(([key, schema]) => ({ key, schema })),
      RESUME_VALUE_OPTIONS,
    ),
  );
  // 媒体裁剪与智能体只读判断共用公共字段声明。
  configureResumeMediaFields(
    RESUME_MEDIA_FIELDS.map(({ moduleKey, field }) => ({ moduleKey, field })),
  );
};
