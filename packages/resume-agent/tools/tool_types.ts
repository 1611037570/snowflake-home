import type { ResumeOperationResult, ResumeWriteOp } from "./resumeOperations";

// 简历工具的运行时上下文，由调用方注入，保持工具本身无副作用依赖
export interface ResumeToolContext {
  // 读取当前简历数据（跟随 AI 助手当前选中的模块）
  getResumeData: () => unknown;
  // 批量执行已经校验通过的语义化写操作
  applyResumeOperations: (operations: ResumeWriteOp[]) => ResumeOperationResult;
  // 读取写入后的完成度与时间线问题，用于确认一键调整是否闭环
  getResumeIssues?: () => string[];
  // 当前入口是否允许修改模块展示标题，默认允许用户明确要求的重命名与翻译。
  allowModuleTitleEdit?: boolean;
  // 更新简历展示语言（翻译完成后同步标题等界面文案语言）
  updateLanguage?: (language: string) => boolean;
}
