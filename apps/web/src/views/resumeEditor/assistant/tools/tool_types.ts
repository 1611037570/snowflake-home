// 简历工具的运行时上下文，由调用方注入，保持工具本身无副作用依赖
export interface ResumeToolContext {
  // 读取当前简历数据（跟随 AI 助手当前选中的模块）
  getResumeData: () => unknown;
  // 数组型模块新增一条空记录并同步表单配置，返回新记录下标（失败返回 -1）
  addDataRecord?: (moduleKey: string) => number;
  // 删除数组型模块记录并同步表单配置
  removeDataRecord?: (moduleKey: string, index: number) => boolean;
  // 移动数组型模块记录并同步表单配置
  moveDataRecord?: (moduleKey: string, from: number, to: number) => boolean;
  // 修改模块级 data 字段（如自定义模块 title）
  updateModuleField?: (moduleKey: string, field: string, value: unknown) => boolean;
  // 修改记录字段
  updateRecordField?: (
    moduleKey: string,
    index: number,
    field: string,
    value: unknown,
  ) => boolean;
  // 更新简历展示语言（翻译完成后同步标题等界面文案语言）
  updateLanguage?: (language: string) => boolean;
}
