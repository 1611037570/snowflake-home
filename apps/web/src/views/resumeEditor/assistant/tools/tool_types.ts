import type {
  ResumeOperationResult,
  ResumeWriteOp,
} from "@/stores/modules/resume/resumeOperations";

// 简历工具的运行时上下文，由调用方注入，保持工具本身无副作用依赖
export interface ResumeToolContext {
  // 读取当前简历数据（跟随 AI 助手当前选中的模块）
  getResumeData: () => unknown;
  // 批量执行已经校验通过的语义化写操作
  applyResumeOperations: (operations: ResumeWriteOp[]) => ResumeOperationResult;
  // 更新简历展示语言（翻译完成后同步标题等界面文案语言）
  updateLanguage?: (language: string) => boolean;
}
