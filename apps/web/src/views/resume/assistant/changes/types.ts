export type ResumeChangeType = "add" | "update" | "delete" | "move";

export interface ResumeFieldChange {
  label: string; // 字段展示名称
  before: string; // 操作发生前的可读内容
  after: string; // 操作完成后的可读内容
  formatOnly: boolean; // 文字一致但富文本格式发生变化
}

export interface ResumeChange {
  type: ResumeChangeType; // 新增、修改、删除或排序
  location: string; // 操作发生时的模块与记录名称
  fields: ResumeFieldChange[]; // 操作涉及的字段前后内容
  beforeOrder?: string[]; // 排序前的记录名称列表
  afterOrder?: string[]; // 排序后的记录名称列表
  from?: number; // 被移动记录的原始下标
  to?: number; // 被移动记录的目标下标
}

export interface ResumeChangeCallbacks {
  onChange: (change: ResumeChange) => void; // 接收已经成功写入的改动
  onError: () => void; // 标记详情捕获失败，不影响简历写入
}

export interface ResumeChangeState {
  items: ResumeChange[]; // 当前回复对应的实际改动
  unavailable: boolean; // 部分详情未能记录，需要提示用户
}
