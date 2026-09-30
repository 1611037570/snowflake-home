/**
 * 分页高度计划。
 * 现状下一次分页里每页的可用高度只有两种取值：首页（会被前面区域占用扣减）与后续页，
 * 用「首页高度 + 后续页高度」表达，比按页回调更贴近真实形状，也少一层间接。
 */
export interface FlowHeightPlan {
  /** 第一个页面的可用高度 */
  firstPageHeight: number;
  /** 后续页面的可用高度 */
  laterPageHeight: number;
}

/** 读取指定页面的可用高度：首页取首页高度，其余页面取后续页高度 */
export const resolvePageHeight = (plan: FlowHeightPlan, pageIndex: number): number =>
  pageIndex === 0 ? plan.firstPageHeight : plan.laterPageHeight;
