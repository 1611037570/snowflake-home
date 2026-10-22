// 宿主提供的简历读取上下文，用于在一次请求内冻结数据授权范围。
export interface ResumeDataContext {
  // 读取已经裁剪并脱敏的当前简历数据。
  getResumeData: () => unknown;
  // 在请求开始前冻结本轮读取范围。
  beforeRequest: (context?: Record<string, unknown>, taskId?: string) => void;
  // 在请求结束后释放本轮读取范围。
  afterRequest: (taskId?: string) => void;
}
