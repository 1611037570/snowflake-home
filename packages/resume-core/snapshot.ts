import { findResumeModuleSchema } from "./schema/resumeSchemaRegistry";
import { richTextToPlainText } from "./format/normalizeRichText";
import { createDesensitizedResumeItem, type DesensitizeField } from "./privacy";
import { omitMediaFromData } from "./mediaFields";

export interface ResumeSnapshotModule {
  readonly title: string; // 模块业务名称。
  readonly data: unknown; // 去除编辑状态与媒体后的实际业务内容。
}

export type ResumeSnapshot = Readonly<Record<string, ResumeSnapshotModule>>;

export interface ResumeSnapshotSource {
  data?: Record<string, any>; // 宿主提供的原始模块数据。
  ui?: Record<string, { layout?: string /* 当前模块的实际展示形态。 */ }>; // 仅用于选择实际生效的数据路径。
}

export interface ResumeSnapshotOptions {
  desensitizeFields: DesensitizeField[]; // 本次读取前需要脱敏的字段。
  moduleTitles?: Record<string, string>; // 宿主提供的默认模块名称。
}

// 快照只处理副本，不切换当前简历，不暴露媒体、选区、会话或写入接口。
export const createResumeSnapshot = (resume: ResumeSnapshotSource, options: ResumeSnapshotOptions): ResumeSnapshot => {
  if (!resume?.data) return {};
  const dataCopy = JSON.parse(JSON.stringify(resume.data));
  const sanitized = createDesensitizedResumeItem({ data: omitMediaFromData(dataCopy) /* 媒体裁剪仅作用于副本。 */ }, options.desensitizeFields);
  const cleanValue = (value: any): any => {
    if (typeof value === "string") return /<\/?[a-z][\s\S]*>/i.test(value) ? richTextToPlainText(value) : value;
    if (Array.isArray(value)) return value.map(cleanValue);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cleanValue(item)]));
  };
  return Object.fromEntries(Object.entries(sanitized.data || {}).flatMap(([key, value]) => {
    const module = value as any;
    if (!module || typeof module !== "object") return [];
    const schema = findResumeModuleSchema(key, undefined, resume.ui?.[key]?.layout);
    const data = schema ? schema.dataPath.reduce((node: any, part) => node?.[part], module) : module.data ?? module.list;
    if (data == null) return [];
    return [[key, {
      title: module.ui?.title || options.moduleTitles?.[key] || key, // 只保留模块业务名称。
      data: cleanValue(Array.isArray(data) ? data.map((record: any) => record.data ?? record) : data), // 按实际数据形态读取业务事实。
    }]];
  }));
};
