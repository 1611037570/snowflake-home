/**
 * useSmartOnePage —— 智能一页自适应 Hook
 *
 * 复用现有分页算法（useResumePages）与测量逻辑（useRowInfo）。
 * 当内容超过一页时，在设定的"可用参数"（页边距 / 字体大小 / 行间距 / 模块间距）
 * 最小取值范围内，按压缩优先级逐项向下调节参数，直到内容收敛为单页且不超出页面。
 *
 * 说明：
 *   - 参数只会向下压缩、不会自动回弹，避免收敛震荡；用户手动调整参数时会以新值重新收敛
 *   - 测量是异步的（DOM 测量防抖），收敛状态见 ready / isOnePage / canFit
 */
import { computed, ref, toValue, watch, type ComputedRef, type Ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { MODULE_GAP, PAGE_NUMBER_HEIGHT, RESUME_HEIGHT } from "../constants";
import {
  defaultFontSize,
  defaultLineHeight,
  defaultModuleSpacing,
  defaultPadding,
} from "@/stores/modules/resume/uiConfig";
import { useResumePages } from "./useResumePages";
import { useResumeTheme } from "./useResumeTheme";

/** 可被智能压缩的 ui 字段 */
export type OnePageAdjustKey = "padding" | "fontSize" | "lineHeight" | "moduleSpacing";

/** 单个可调参数的压缩配置：从当前值向下压缩到 min，每次按 step 取整 */
export interface OnePageAdjustableItem {
  key: OnePageAdjustKey;
  min: number;
  step: number;
}

/** 默认可用参数（与编辑器滑杆范围一致）；数组顺序即压缩优先级：先压缩间距，后压缩行高、字号 */
export const defaultOnePageAdjustable: OnePageAdjustableItem[] = [
  { key: "moduleSpacing", min: 2, step: 1 },
  { key: "padding", min: 2, step: 1 },
  { key: "lineHeight", min: 1, step: 0.1 },
  { key: "fontSize", min: 10, step: 2 },
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
  /** 编辑态选中的模块 */
  selectedModule: Ref<any[]>;
  /** 是否只读（决定是否渲染选中高亮） */
  isReadonly: ComputedRef<boolean>;
  /** 可调节参数（数组顺序即压缩优先级），默认 defaultOnePageAdjustable */
  adjustable?: OnePageAdjustableItem[];
  /** 是否启用自动收敛（默认 true）；传响应式值可在点击等时机再启用 */
  enabled?: boolean | ComputedRef<boolean> | Ref<boolean>;
}

export const useSmartOnePage = ({
  ui,
  showPageNumber,
  selectedModule,
  isReadonly,
  adjustable = defaultOnePageAdjustable,
  enabled = true,
}: UseSmartOnePageOptions) => {
  // 实例唯一前缀，隔离多实例的分页裁剪样式
  const uid = `sp-${Math.random().toString(36).slice(2, 8)}`;
  // 测量容器 ref，由调用方绑定到隐藏测量容器
  const measureRef = ref<HTMLElement | null>(null);

  // 读取 ui 中可调字段的当前值，缺失时用默认值兜底
  const pickAdjustable = (source: Record<string, any>) => {
    const result = {} as Record<OnePageAdjustKey, number>;
    for (const { key } of adjustable) {
      const value = source[key];
      result[key] = typeof value === "number" ? value : uiDefaults[key];
    }
    return result;
  };

  // 当前压缩参数快照（只向下压缩，不回弹）
  const fitParams = ref<Record<OnePageAdjustKey, number>>(pickAdjustable(ui.value));

  // 应用压缩参数后的 ui：渲染与测量统一使用它，保证计算一致
  const fitUi = computed<Record<string, any>>(() => ({ ...ui.value, ...fitParams.value }));

  // 主题样式基于 fitUi 生成，并通过 provide 注入给模块子组件
  const themeStyles = useResumeTheme(fitUi);

  // 复用现有测量 + 分页算法
  const { measureDone, pages, moduleClass, getPageStyle, moduleList } = useResumePages({
    measureRef,
    ui: fitUi,
    themeStyles,
    showPageNumber,
    isThumb: computed(() => false),
    selectedModule,
    isReadonly,
    uid,
  });

  // 收敛状态
  const ready = ref(false); // 是否已收敛（单页或已到可用参数下限）
  const isOnePage = ref(false); // 是否成功收敛为单页
  const canFit = ref(true); // 是否在可用参数范围内可压缩到一页

  // 是否启用自动收敛（支持点击等时机再启用）
  const enabledRef = computed(() => toValue(enabled));

  // 依据当前测量结果计算下一步压缩参数；无法再压缩时返回 null
  const computeNext = (): Partial<Record<OnePageAdjustKey, number>> | null => {
    const rows = moduleList.value.flatMap((group) => group.rows);
    if (rows.length === 0) return null;
    const spacing = fitParams.value.moduleSpacing ?? MODULE_GAP;
    const padding = fitParams.value.padding ?? 0;
    const bottomSpace = showPageNumber.value ? PAGE_NUMBER_HEIGHT : 0;
    // 与分页算法保持一致：可用高度 = 页面高度 - 页边距 - 页码区高度
    const availHeight = RESUME_HEIGHT - padding - bottomSpace;
    // 单页内容总高度 = 所有行高 + 模块间距 × 模块间隔数
    const totalHeight =
      rows.reduce((sum, row) => sum + row.height, 0) + spacing * (moduleList.value.length - 1);
    const scale = totalHeight > 0 ? Math.min(1, availHeight / totalHeight) : 1;

    // 按优先级逐项压缩：目标值向下取整到步长且不低于 min，无实际变化才尝试下一项
    for (const { key, min, step } of adjustable) {
      const current = fitParams.value[key];
      if (current == null) continue;
      const target = Math.max(floorByStep(current * scale, step), min);
      if (target < current - 1e-9) return { [key]: target };
    }
    return null;
  };

  // 收敛一步：已是单页则完成；否则继续压缩参数
  const evaluate = () => {
    if (moduleList.value.length === 0) return; // 尚未测量
    if (!enabledRef.value) return; // 未启用时保持用户参数
    if (pages.value.length === 1) {
      ready.value = true;
      isOnePage.value = true;
      canFit.value = true;
      return;
    }
    const next = computeNext();
    if (!next) {
      // 可用参数已到下限仍超过一页：停止，标记无法压缩
      ready.value = true;
      isOnePage.value = false;
      canFit.value = false;
      return;
    }
    ready.value = false;
    fitParams.value = { ...fitParams.value, ...next };
  };

  // 参数或分页结果变化后，等待测量收敛（测量自身有 100ms 防抖，这里留出余量）再评估
  const scheduleEvaluate = useDebounceFn(evaluate, 200);
  watch(pages, scheduleEvaluate);
  watch(moduleList, scheduleEvaluate);
  // 启用收敛的瞬间立即评估一次（点击触发）
  watch(enabledRef, (val) => {
    if (val) scheduleEvaluate();
  });

  // 用户手动调整可调参数时，以用户设置的新值为准重新收敛
  watch(
    () => adjustable.map(({ key }) => ui.value[key]),
    () => {
      fitParams.value = { ...fitParams.value, ...pickAdjustable(ui.value) };
      ready.value = false;
      scheduleEvaluate();
    },
  );

  return {
    fitUi,
    themeStyles,
    measureRef,
    measureDone,
    pages,
    moduleClass,
    getPageStyle,
    uid,
    fitParams,
    ready,
    isOnePage,
    canFit,
  };
};
