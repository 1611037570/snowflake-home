/**
 * useResumePages —— 简历分页核心逻辑
 *
 * 封装测量（useRowInfo）、分页算法与每页可见行裁剪样式生成，
 * 供 resumePages/index.vue 组合使用。
 */
import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
import { MODULE_GAP, PAGE_NUMBER_HEIGHT, RESUME_HEIGHT } from "../constants";
import { useRowInfo, type ModuleInfo, type RowInfo } from "../useRowInfo";
import type { ResumeTheme } from "./useResumeTheme";

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

/** useResumePages 入参 */
interface UseResumePagesOptions {
  measureRef: Ref<HTMLElement | null>;
  ui: ComputedRef<Record<string, any>>;
  themeStyles: ResumeTheme;
  showPageNumber: ComputedRef<boolean>;
  isThumb: ComputedRef<boolean>;
  selectedModule: Ref<any[]>;
  isReadonly: ComputedRef<boolean>;
  uid: string;
}

/**
 * 组合测量与分页逻辑
 * @param options - 测量容器、模块列表、主题样式、模式标记等
 */
export const useResumePages = ({
  measureRef,
  ui,
  themeStyles,
  showPageNumber,
  isThumb,
  selectedModule,
  isReadonly,
  uid,
}: UseResumePagesOptions) => {
  // 测量监听配置：风格模板切换会改变行高，纳入监听触发重新测量分页
  const watchOptions = computed(() => ({
    padding: ui.value.padding,
    fontSize: ui.value.fontSize,
    lineHeight: ui.value.lineHeight,
    fontFamily: ui.value.fontFamily,
    themeTemplate: themeStyles.themeTemplate.value,
    showPageNumber: showPageNumber.value,
  }));
  const { moduleList } = useRowInfo(measureRef, watchOptions, {
    // 缩略图模式：首次测量成功后冻结，销毁测量容器也不会清空行数据
    stopAfterFirstMeasure: isThumb.value,
  });

  // 缩略图测量完成即销毁隐藏的测量容器，减少无用 DOM 与监听开销
  const measureDone = ref(false);
  watch(moduleList, (list) => {
    if (isThumb.value && list.length > 0) measureDone.value = true;
  });

  // 分页逻辑：所有内容按块贪心装入页面；user 模块整体作为一块，其余模块每行一块
  const pages = computed<PageSlice[][]>(() => {
    const padding = ui.value.padding || 0;
    const moduleSpacing = ui.value.moduleSpacing ?? MODULE_GAP;
    const bottomSpace = showPageNumber.value ? PAGE_NUMBER_HEIGHT : 0;
    // 仅根据页码区域高度计算页面可用内容高度
    const maxContentHeight = RESUME_HEIGHT - padding - bottomSpace;

    const result: PageSlice[][] = [];
    let currentPage: PageSlice[] = [];
    let currentHeight = 0;
    // 当前正在累积的行切片（同一模块的连续行）
    let sliceModule: ModuleInfo | null = null;
    let sliceRows: RowInfo[] = [];

    // 把当前切片提交为页上的一个模块块
    const commitSlice = () => {
      if (!sliceModule || sliceRows.length === 0) return;
      const firstRow = sliceRows[0]!;
      const lastRow = sliceRows[sliceRows.length - 1]!;
      currentPage.push({
        moduleKey: sliceModule.moduleKey,
        // 行按顺序累积，取首尾即可描述本页可见区间，避免逐行枚举
        visibleStart: firstRow.index,
        visibleEnd: lastRow.index,
        totalRows: sliceModule.rows.length,
      });
      sliceModule = null;
      sliceRows = [];
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

    // 分页块：一组必须同页的行，user 模块整体一块，其余模块按行展开
    const blocks: { group: ModuleInfo; rows: RowInfo[]; height: number }[] = [];
    moduleList.value.forEach((group) => {
      if (group.moduleKey === "user" && group.rows.length > 0) {
        // user 模块整体不可拆分，防止跨页切分
        blocks.push({
          group,
          rows: group.rows,
          height: group.rows.reduce((sum, row) => sum + row.height, 0),
        });
        return;
      }
      group.rows.forEach((row) => blocks.push({ group, rows: [row], height: row.height }));
    });

    for (const { group, rows, height } of blocks) {
      // 遇到新模块，先提交上一个切片，让 currentPage 如实反映页内内容
      if (sliceModule && sliceModule !== group) commitSlice();

      // 当前切片尚未提交时，页面同样已经有内容，避免大字号或大间距时继续挤在当前页
      const hasPageContent = currentPage.length > 0 || sliceRows.length > 0;
      // 模块间距：新模块的首块且当前页已有内容时才计一次
      let gap = hasPageContent && sliceModule !== group ? moduleSpacing : 0;

      // 放不下时：当前页已有内容则翻页重试；空页仍放不下（单块超高）则硬塞
      if (currentHeight + gap + height > maxContentHeight && hasPageContent) {
        newPage();
        // 缩略图模式仅需第一页：翻页后不再继续计算后续页
        if (isThumb.value) return result;
        gap = 0; // 新页无内容，不再计间距
      }

      sliceModule = group;
      sliceRows.push(...rows);
      currentHeight += gap + height;
    }

    // 提交最后切片并补录最后一页（无任何内容时保留一个空页）
    newPage();
    if (result.length === 0) result.push(currentPage);

    return result;
  });

  // 模块外层样式：只读模式不渲染选中高亮与虚线框
  const selectedKeys = computed(() => new Set(selectedModule.value.map((item) => item.key)));
  const moduleClass = (slice: PageSlice) => {
    if (isReadonly.value) return "";
    const isSelected = selectedKeys.value.has(slice.moduleKey);
    return isSelected
      ? "outline-2 outline-offset-3 outline-dashed outline-sf-theme"
      : "outline-2 outline-offset-3 outline-dashed outline-transparent hover:outline-sf-theme-2";
  };

  // 生成每页可见行裁剪样式；分页按顺序切分，隐藏行必为区间两端，
  // 用 nth-child 区间选择器替代逐行枚举，避免选择器随行数膨胀
  const buildPageStyle = (pageSlices: PageSlice[], pageIndex: number) => {
    return pageSlices
      .flatMap((slice) => {
        const base = `.${uid}-page-${pageIndex} .resume-module-wrapper[data-module="${slice.moduleKey}"] > .resume-row`;
        const rules: string[] = [];
        // 隐藏区间之前的行
        if (slice.visibleStart > 0) {
          rules.push(
            `${base} > :nth-child(-n+${slice.visibleStart}) { display: none !important; }`,
          );
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
  const pageStyleText = computed(() =>
    pages.value.map((pageSlices, pageIndex) => buildPageStyle(pageSlices, pageIndex)).join("\n"),
  );

  // 透出测量结果（模块行高），供智能一页等上层逻辑按比例压缩参数
  return { measureDone, pages, pageStyleText, moduleClass, moduleList };
};
