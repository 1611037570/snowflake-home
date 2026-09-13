/**
 * paginate —— 简历分页纯算法
 *
 * 输入模块行高列表与页面参数，输出每页模块切片与裁剪样式文本。
 * 纯函数无 DOM/响应式依赖，可独立单测，由 useResumePages 接线调用。
 */
import { getContentHeight } from "../constants";
import type { ModuleInfo } from "./useRowInfo";

/** 单页内一个模块的切片信息 */
export interface PageSlice {
  moduleKey: string;
  /** 本页可见行区间起点（0-based，含） */
  visibleStart: number;
  /** 本页可见行区间终点（0-based，含） */
  visibleEnd: number;
  /** 模块总行数，用于判断区间之后是否还有隐藏行 */
  totalRows: number;
}

/** 分页入参 */
export interface PaginateOptions {
  moduleList: ModuleInfo[];
  padding: number;
  moduleSpacing: number;
  showPageNumber: boolean;
  /** 仅需第一页时翻页即提前终止（缩略图场景） */
  stopAfterFirstPage?: boolean;
}

/**
 * 分页算法：所有内容按块贪心装入页面；user 模块整体作为一块，其余模块每行一块。
 * @returns 每页的模块切片列表；缩略图提前终止时返回已装好的页
 */
export const paginateModules = ({
  moduleList,
  padding,
  moduleSpacing,
  showPageNumber,
  stopAfterFirstPage,
}: PaginateOptions): PageSlice[][] => {
  // 仅根据页码区域高度计算页面可用内容高度（与智能一页共用统一公式）
  const maxContentHeight = getContentHeight(padding, showPageNumber);
  // 模块间距缺省或非数值时按 0 处理，避免累加得到 NaN 导致翻页判定恒不触发
  const safeModuleSpacing = Number.isFinite(moduleSpacing) ? moduleSpacing : 0;

  const result: PageSlice[][] = [];
  let currentPage: PageSlice[] = [];
  let currentHeight = 0;
  // 当前正在累积的行切片（同一模块的连续行，仅记录首尾行号，避免逐行存数组）
  let sliceModule: ModuleInfo | null = null;
  let sliceStart = -1;
  let sliceEnd = -1;

  // 把当前切片提交为页上的一个模块块
  const commitSlice = () => {
    if (!sliceModule || sliceEnd < 0) return;
    currentPage.push({
      moduleKey: sliceModule.moduleKey,
      // 行按顺序累积，取首尾行号即可描述本页可见区间，避免逐行枚举
      visibleStart: sliceStart,
      visibleEnd: sliceEnd,
      totalRows: sliceModule.rows.length,
    });
    sliceModule = null;
    sliceEnd = -1;
  };
  // 翻页：提交切片并把当前页存入结果
  const newPage = () => {
    commitSlice();
    if (currentPage.length > 0) {
      result.push(currentPage);
      currentPage = [];
      currentHeight = 0;
    }
  };

  // 将一段连续行（首尾行号区间）装入当前页；翻页后缩略图模式停止并返回 false
  const placeRows = (group: ModuleInfo, start: number, end: number, height: number): boolean => {
    // 遇到新模块，先提交上一个切片，让 currentPage 如实反映页内内容
    if (sliceModule && sliceModule !== group) commitSlice();

    // 当前切片尚未提交时，页面同样已经有内容，避免大字号或大间距时继续挤在当前页
    const hasPageContent = currentPage.length > 0 || sliceEnd >= 0;
    // 模块间距：新模块的首块且当前页已有内容时才计一次
    let gap = hasPageContent && sliceModule !== group ? safeModuleSpacing : 0;

    // 放不下时：当前页已有内容则翻页重试；空页仍放不下（单块超高）则硬塞
    if (currentHeight + gap + height > maxContentHeight && hasPageContent) {
      newPage();
      // 缩略图模式仅需第一页：翻页后不再继续计算后续页
      if (stopAfterFirstPage) return false;
      gap = 0; // 新页无内容，不再计间距
    }

    sliceModule = group;
    if (sliceEnd < 0) sliceStart = start;
    sliceEnd = end;
    currentHeight += gap + height;
    return true;
  };

  // 直接遍历模块列表分页；user 模块整体一块，其余模块逐行一块，避免先构建中间数组再二次遍历
  for (const group of moduleList) {
    if (group.moduleKey === "user" && group.rows.length > 0) {
      // user 模块整体不可拆分，防止跨页切分
      const height = group.rows.reduce((sum, row) => sum + row.height, 0);
      const firstRow = group.rows[0]!;
      const lastRow = group.rows[group.rows.length - 1]!;
      if (!placeRows(group, firstRow.index, lastRow.index, height)) return result;
      continue;
    }
    for (const row of group.rows) {
      if (!placeRows(group, row.index, row.index, row.height)) return result;
    }
  }

  // 提交最后切片并补录最后一页（无任何内容时保留一个空页）
  newPage();
  if (result.length === 0) result.push(currentPage);

  return result;
};

/** 生成单页可见行裁剪样式；隐藏行必为区间两端，用 nth-child 区间选择器避免逐行枚举 */
export const buildPageStyle = (pageSlices: PageSlice[], pageIndex: number, uid: string) => {
  return pageSlices
    .flatMap((slice) => {
      const base = `.${uid}-page-${pageIndex} .resume-module-wrapper[data-module="${slice.moduleKey}"] > .resume-row`;
      const rules: string[] = [];
      // 隐藏区间之前的行
      if (slice.visibleStart > 0) {
        rules.push(`${base} > :nth-child(-n+${slice.visibleStart}) { display: none !important; }`);
      }
      // 隐藏区间之后的行
      if (slice.visibleEnd < slice.totalRows - 1) {
        rules.push(
          `${base} > :nth-child(n+${slice.visibleEnd + 2}) { display: none !important; }`,
        );
      }
      return rules;
    })
    .join("\n");
};

/** 汇总全部页的裁剪样式文本 */
export const buildPagesStyleText = (pages: PageSlice[][], uid: string) =>
  pages.map((pageSlices, pageIndex) => buildPageStyle(pageSlices, pageIndex, uid)).join("\n");