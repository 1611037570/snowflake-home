/**
 * useResumePages —— 简历分页核心逻辑
 *
 * 封装测量（useRowInfo）、分页算法与每页可见行裁剪样式生成，
 * 供 resumePages/index.vue 组合使用。
 */
import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
import { MODULE_GAP, RESUME_HEIGHT } from "../constants";
import { useRowInfo } from "../useRowInfo";
import type { ResumeTheme } from "./useResumeTheme";

/** 单页内一个模块的切片信息 */
export interface PageSlice {
  moduleKey: string;
  visibleRowIndexes: number[];
}

/** useResumePages 入参 */
interface UseResumePagesOptions {
  measureRef: Ref<HTMLElement | null>;
  allModules: ComputedRef<Record<string, any>[]>;
  ui: ComputedRef<Record<string, any>>;
  themeStyles: ResumeTheme;
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
  allModules,
  ui,
  themeStyles,
  isThumb,
  selectedModule,
  isReadonly,
  uid,
}: UseResumePagesOptions) => {
  // 测量监听配置：风格模板切换会改变行高，纳入监听触发重新测量分页
  const o = computed(() => ({
    paddingValue: themeStyles.paddingValue.value(),
    fontValue: themeStyles.fontValue.value(),
    lineHeightValue: themeStyles.lineHeightValue.value(),
    themeTemplate: themeStyles.themeTemplate.value,
  }));
  const { moduleList } = useRowInfo(measureRef, o, {
    // 缩略图模式：首次测量成功后冻结，销毁测量容器也不会清空行数据
    stopAfterFirstMeasure: isThumb.value,
  });

  // 缩略图测量完成即销毁隐藏的测量容器，减少无用 DOM 与监听开销
  const measureDone = ref(false);
  watch(moduleList, (list) => {
    if (isThumb.value && list.length > 0) measureDone.value = true;
  });

  // 分页逻辑：展平所有模块行，逐行贪心装入页面
  const pages = computed<PageSlice[][]>(() => {
    const padding = ui.value.padding || 0;
    const maxContentHeight = RESUME_HEIGHT - padding - 32; // 减去上内边距和页脚空间（底部无内边距）

    const result: PageSlice[][] = [];
    let currentPage: PageSlice[] = [];
    let currentHeight = 0;
    // 当前正在累积的行切片（同一模块的连续行）
    let sliceModule: { moduleKey: string } | null = null;
    let sliceRows: { index: number }[] = [];

    // 把当前切片提交为页上的一个模块块
    const commitSlice = () => {
      if (!sliceModule || sliceRows.length === 0) return;
      currentPage.push({
        moduleKey: sliceModule.moduleKey,
        visibleRowIndexes: sliceRows.map((r) => r.index),
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

    const items = moduleList.value.flatMap((group) =>
      group.rows.map((row, index) => ({ group, row, isHead: index === 0 })),
    );

    for (const { group, row, isHead } of items) {
      // 遇到新模块，先提交上一个切片，让 currentPage 如实反映页内内容
      if (sliceModule && sliceModule !== group) commitSlice();

      // 模块间距：模块首行且当前页已有内容时才计一次
      let gap = currentPage.length > 0 && isHead ? MODULE_GAP : 0;

      // 放不下时：当前页已有内容则翻页重试；空页仍放不下（单行超高）则硬塞
      if (currentHeight + gap + row.height > maxContentHeight && currentPage.length > 0) {
        newPage();
        // 缩略图模式仅需第一页：翻页后不再继续计算后续页
        if (isThumb.value) return result;
        gap = 0; // 新页无内容，不再计间距
      }

      sliceModule = group;
      sliceRows.push(row);
      currentHeight += gap + row.height;
    }

    // 提交最后切片并补录最后一页（无任何内容时保留一个空页）
    newPage();
    if (result.length === 0) result.push(currentPage);

    return result;
  });

  // 模块外层样式：只读模式不渲染选中高亮与虚线框
  const moduleClass = (slice: PageSlice) => {
    if (isReadonly.value) return "";
    const isSelected = selectedModule.value.find((item) => item.key === slice.moduleKey);
    return [
      "outline-2 outline-offset-3 outline-dashed",
      isSelected ? "outline-sf-theme" : "outline-transparent hover:outline-sf-theme-2",
    ];
  };

  // 生成每页的可见行裁剪样式（用实例唯一前缀隔离多实例）
  const getPageStyle = (pageSlices: PageSlice[], pageIndex: number) => {
    return pageSlices
      .map((slice) => {
        const visibleSelectors = slice.visibleRowIndexes
          .map((idx) => `:nth-child(${idx + 1})`)
          .join(",");
        return `.${uid}-page-${pageIndex} .resume-module-wrapper[data-module="${slice.moduleKey}"] > .resume-row > :not(${visibleSelectors}) { display: none !important; }`;
      })
      .join("\n");
  };

  return { measureDone, pages, moduleClass, getPageStyle };
};
