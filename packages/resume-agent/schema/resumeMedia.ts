// 简历中不允许交给 AI 读取或写入的媒体字段。
export interface ResumeMediaField {
  // 媒体字段所属模块的稳定标识。
  moduleKey: string;
  // 承载媒体内容的字段名称。
  field: string;
}

let mediaFields: ResumeMediaField[] = [];

// 注册宿主简历数据中的媒体字段声明。
export const configureResumeMediaFields = (fields: ResumeMediaField[]) => {
  mediaFields = fields.map((field) => ({ ...field }));
};

// 判断字段是否属于禁止 AI 读写的媒体内容。
export const isResumeMediaField = (moduleKey: string, field: string): boolean =>
  mediaFields.some((item) => item.moduleKey === moduleKey && item.field === field);
