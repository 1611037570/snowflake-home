import { createResumeSnapshot, type ResumeSnapshotSource } from "@snowflake/resume-core";
import { DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/config/defaultConfig";

// 页面仅提供当前选定的数据与展示名称，公共包统一生成只读业务快照。
export const createResumeSnapshotForAi = (resume: ResumeSnapshotSource, desensitize: boolean) => createResumeSnapshot(resume, {
  desensitizeFields: desensitize ? ["name", "phone", "email", "wechat"] : [], // 本次发送前需要隐藏的身份与联系方式。
  moduleTitles: Object.fromEntries(DEFAULT_MODULE_NAMES.map((item) => [item.key, item.name])), // 公共快照使用的模块名称。
});
