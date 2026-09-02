/**
 * useSmartOnePage —— 智能一页自适应
 *
 * 直接复用预览层（编辑态 ResumePages 实例）的测量结果 moduleList（模块+行高），
 * 不再挂载独立测量容器，避免重复渲染整份简历与重复注册观察器。
 *
 * 压缩计算为纯数学估算：
 *   - 模块间距、页边距对单页判断是精确的（与分页算法公式一致）
 *   - 行高、字号按比例缩放估算行高
 * 参数只向下压缩、不会回弹，按压缩优先级逐项进行。
 */
import { inject, type ComputedRef } from "vue";
import { PAGE_NUMBER_HEIGHT, RESUME_HEIGHT } from "../constants";
import {
  defaultFontSize,
  defaultLineHeight,
  defaultModuleSpacing,
  defaultPadding,
  uiParamRanges,
} from "@/stores/modules/resume/uiConfig";

/** 可被智能压缩的 ui 字段 */
export type OnePageAdjustKey = "padding" | "fontSize" | "lineHeight" | "moduleSpacing";

/** 单个可调参数的压缩配置：从当前值向下压缩到 min，每次按 step 取整 */
export interface OnePageAdjustableItem {
  key: OnePageAdjustKey;
  min: number;
  step: number;
}

/** 默认可用参数（取自 uiConfig.uiParamRanges，与编辑器滑杆范围一致）；数组顺序即压缩优先级：先压缩间距，后压缩行高、字号 */
export const defaultOnePageAdjustable: OnePageAdjustableItem[] = [
  {
    key: "moduleSpacing",
    min: uiParamRanges.moduleSpacing.min,
    step: uiParamRanges.moduleSpacing.step,
  },
  { key: "padding", min: uiParamRanges.padding.min, step: uiParamRanges.padding.step },
  { key: "lineHeight", min: uiParamRanges.lineHeight.min, step: uiParamRanges.lineHeight.step },
  { key: "fontSize", min: uiParamRanges.fontSize.min, step: uiParamRanges.fontSize.step },
];

/** 可调字段缺失时的兜底默认值 */
const uiDefaults: Record<OnePageAdjustKey, number> = {
  padding: defaultPadding,
  fontSize: defaultFontSize,
  lineHeight: defaultLineHeight,
  moduleSpacing: defaultModuleSpacing,
};

/** 按步长向下取整（浮点步长做精度兜底） */
const floorByStep = (value: number, step: number) => {
  const stepped = Math.floor(value / step + 1e-9) * step;
  return Number(stepped.toFixed(4));
};

/** useSmartOnePage 入参 */
interface UseSmartOnePageOptions {
  /** 用户设置的 ui（响应式） */
  ui: ComputedRef<Record<string, any>>;
  /** 是否显示页码 */
  showPageNumber: ComputedRef<boolean>;
  /** 可调节参数（数组顺序即压缩优先级），默认 defaultOnePageAdjustable */
  adjustable?: OnePageAdjustableItem[];
}

export const useSmartOnePage = ({
  ui,
  showPageNumber,
  adjustable = defaultOnePageAdjustable,
}: UseSmartOnePageOptions) => {
  // 复用预览层测量结果（编辑态 ResumePages 实例注入的共享 ref）
  const previewModuleList = inject<any>("previewModuleList", null);

  // 读取 ui 中可调字段的当前值，缺失时用默认值兜底
  const pickAdjustable = (source: Record<string, any>) => {
    const result = {} as Record<OnePageAdjustKey, number>;
    for (const { key } of adjustable) {
      const value = source[key];
      result[key] = typeof value === "number" ? value : uiDefaults[key];
    }
    return result;
  };

  /**
   * 依据预览层测量结果同步计算可压到一页的参数组合
   * @returns 参数组合与是否成功；测量未就绪时返回 null
   */
  const computeFit = (): { fitParams: Record<OnePageAdjustKey, number>; ok: boolean } | null => {
    const list = previewModuleList?.value;
    if (!list || list.length === 0) return null;

    // 测量基准：预览层行高对应原始 ui 参数
    const base = pickAdjustable(ui.value);
    const bottomSpace = showPageNumber.value ? PAGE_NUMBER_HEIGHT : 0;
    // 行数、行高总和在单次计算中固定，单趟聚合，避免每轮压缩重复遍历全部行
    const { rowCount, rowsTotal } = list.reduce(
      (acc: { rowCount: number; rowsTotal: number }, group: any) => {
        acc.rowCount += group.rows.length;
        acc.rowsTotal += group.rows.reduce(
          (groupSum: number, row: any) => groupSum + row.height,
          0,
        );
        return acc;
      },
      { rowCount: 0, rowsTotal: 0 },
    );
    if (rowCount === 0) return null;
    const moduleGapCount = Math.max(list.length - 1, 0);
    const baseScale = base.fontSize * base.lineHeight;

    // 估算总高：行高按字号×行高比例缩放，模块间距计入模块间隔
    const estimateTotal = (params: Record<OnePageAdjustKey, number>) => {
      const scale = (params.fontSize * params.lineHeight) / baseScale;
      return rowsTotal * scale + params.moduleSpacing * moduleGapCount;
    };
    // 可用内容高：页面高 - 页边距 - 页码区高
    const estimateAvail = (padding: number) => RESUME_HEIGHT - padding - bottomSpace;
    const fits = (params: Record<OnePageAdjustKey, number>) =>
      estimateTotal(params) <= estimateAvail(params.padding);

    // 当前参数已能放下则直接成功
    if (fits(base)) return { fitParams: base, ok: true };

    // 按优先级逐项向下压缩，找到能放下的参数组合
    const params = { ...base };
    for (const { key, min, step } of adjustable) {
      let val = params[key];
      while (val > min + 1e-9) {
        const next = Math.max(floorByStep(val - step, step), min);
        params[key] = next;
        if (fits(params)) return { fitParams: { ...params }, ok: true };
        val = next;
      }
    }
    // 全部参数压到下限仍放不下
    return { fitParams: params, ok: false };
  };

  return { computeFit };
};
