/**
 * useRowInfo —— 简历分页的测量核心
 *
 * 作用：监听测量容器（MeasureContent）的 DOM 变化，扫描容器内所有 `.resume-module-wrapper`
 * 模块包装元素，读取每个模块下每个"行"的高度，组装成分页所需的模块信息列表。
 *
 * 数据流：
 *   测量容器渲染 → DOM 生成 → 本 Hook 扫描读取高度 → moduleList（模块 + 行信息）
 *   → page.vue 的 pages computed 依据行高做分页裁剪
 *
 * 关键约定：
 *   - 模块包装元素（wrapper）通过 `data-module` 标记模块类型（如 "user"、"custom_xxx"）
 *   - 自定义模块的 data-module 即其唯一 key，天然区分多个自定义模块
 *   - 行信息只在"行数或行高发生变化"时才更新，避免不必要的重渲染
 */
import { unrefElement, useDebounceFn, useMutationObserver, useResizeObserver } from "@vueuse/core";
import { ref, watch, type Ref, type WatchSource } from "vue";

/** 单个"行"的信息（模块内部的一个 div） */
export interface RowInfo {
  height: number; // 行高度（offsetHeight + marginTop + marginBottom）
  index: number; // 行在模块内的序号（从 0 开始，用于分页裁剪 :nth-child）
}

/** 单个"模块"的信息（.resume-module-wrapper 包装元素） */
export interface ModuleInfo {
  moduleKey: string; // 模块类型 key（来自 data-module，如 "user"、"custom_xxx"）
  rows: RowInfo[]; // 模块下的所有行
}

/** 判断两次测量结果的结构与行高是否发生变化（直接复用上一次 moduleList，避免额外快照冗余） */
const isSnapshotChanged = (prev: ModuleInfo[] | null, curr: ModuleInfo[]): boolean => {
  if (!prev || prev.length !== curr.length) return true;
  for (let i = 0; i < curr.length; i++) {
    const p = prev[i]!;
    const c = curr[i]!;
    if (p.moduleKey !== c.moduleKey || p.rows.length !== c.rows.length) return true;
    for (let j = 0; j < c.rows.length; j++) {
      if (p.rows[j]!.height !== c.rows[j]!.height) return true;
    }
  }
  return false;
};

/**
 * 读取根 div 一级子元素的行高信息，供分页逻辑使用
 * @param rootRef - 测量容器的 ref（支持原生 div 或组件实例，内部通过 unrefElement 取 $el）
 * @param watchOptions - 监听选项（样式变化时触发重新测量）
 * @param options - 可选配置：stopAfterFirstMeasure 首次测量成功后冻结，容器销毁后不重复扫描（缩略图场景）
 * @returns 模块 + 行信息的响应式列表
 */
export function useRowInfo(
  rootRef: Ref<HTMLElement | null>,
  watchOptions: WatchSource,
  options?: {
    stopAfterFirstMeasure?: boolean;
    /** 测量完成所需模块数：缩略图内容异步挂载时避免中途提前冻结 */
    expectedModuleCount?: number;
    /** 测量防抖延迟（ms）：缩略图静态数据可传 0 立即测量 */
    debounce?: number;
  },
) {
  const selector = ".resume-module-wrapper";
  const moduleList = ref<ModuleInfo[]>([]);
  // 替换前的 moduleList 即上一次测量结果，直接作为比较基准，无需额外快照
  // 单次测量模式（缩略图 page=1）：测量成功后冻结，避免测量容器销毁后清空行数据
  let frozen = false;
  // 冻结后释放全部监听器，避免缩略图测量完成后空跑（监听器创建后赋值）
  let stopAll: (() => void) | null = null;

  /** 行高度 = offsetHeight（含 padding/border）+ 上下 margin */
  const rowHeight = (el: HTMLElement): number => {
    const { marginTop, marginBottom } = window.getComputedStyle(el);
    return el.offsetHeight + (parseFloat(marginTop) || 0) + (parseFloat(marginBottom) || 0);
  };

  /**
   * 扫描测量容器：收集所有模块及行信息
   * 只关心模块结构 + 行高度（内容 html 变化不参与比较），无变化时不更新 moduleList
   */
  const measure = () => {
    if (frozen) return;
    // unrefElement 兼容原生 DOM 与组件实例（自动取 $el）
    const root = unrefElement(rootRef);
    if (!root) {
      moduleList.value = [];
      return;
    }
    const modules: ModuleInfo[] = Array.from(
      root.querySelectorAll<HTMLElement>(selector),
      (wrapper) => {
        const moduleKey = wrapper.dataset.module || "";
        return {
          moduleKey,
          rows: Array.from(wrapper.children, (div, index) => {
            const el = div as HTMLElement;
            return { height: rowHeight(el), index };
          }),
        };
      },
    );
    const prev = moduleList.value;
    // 单次测量模式：模块齐全（含异步挂载的期望模块数）才更新并冻结，
    // 避免内容挂载中途以不完整行高提前冻结或引起闪烁
    const expected = options?.expectedModuleCount;
    const complete =
      !options?.stopAfterFirstMeasure ||
      (modules.length > 0 && (expected == null || modules.length >= expected));
    if (complete && isSnapshotChanged(prev, modules)) {
      moduleList.value = modules;
      if (options?.stopAfterFirstMeasure) {
        frozen = true;
        stopAll?.();
      }
    }
  };
  // 防抖处理，避免连续 DOM 变化时高频执行测量（缩略图静态数据可配 0 立即测量）
  const debouncedMeasure = useDebounceFn(measure, options?.debounce ?? 100);

  const stopWatchRoot = watch(rootRef, debouncedMeasure, { immediate: true });
  // 容器尺寸变化（如缩放）时重新测量
  const { stop: stopResize } = useResizeObserver(rootRef, debouncedMeasure);
  // 容器内 DOM 增删、文本变化时重新测量（内容编辑会改变高度）
  const { stop: stopMutation } = useMutationObserver(rootRef, debouncedMeasure, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  // 样式配置（字号/行高/内边距）变化会改变高度，需重新测量
  const stopWatchOptions = watch(watchOptions, debouncedMeasure);
  // 冻结后释放全部监听，避免缩略图测量完成后空跑
  stopAll = () => {
    stopWatchRoot();
    stopResize();
    stopMutation();
    stopWatchOptions();
  };

  return { moduleList };
}
