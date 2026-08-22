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
 *   - 模块包装元素（wrapper）通过 `data-module` 标记模块类型（如 "user"、"custom"）
 *   - 自定义模块额外通过 `data-custom-id` 标记真实数据 key（随机 id），用于区分多个自定义模块
 *   - 行信息只在"行数或行高发生变化"时才更新，避免不必要的重渲染
 */
import { unrefElement, useDebounceFn, useMutationObserver, useResizeObserver } from "@vueuse/core";
import { ref, watch, type Ref } from "vue";

/** 单个"行"的信息（模块内部的一个 div） */
interface RowInfo {
  id: string; // 写入 DOM 的唯一 id（格式：row-item-模块key-序号）
  height: number; // 行高度（offsetHeight + marginTop + marginBottom）
  element: HTMLElement; // 行对应的 DOM 元素
  index: number; // 行在模块内的序号（从 0 开始，用于分页裁剪 :nth-child）
  html: string; // 行的 outerHTML（用于导出等场景）
}

/** 单个"模块"的信息（.resume-module-wrapper 包装元素） */
interface ModuleInfo {
  moduleKey: string; // 模块类型 key（来自 data-module，如 "user"、"custom"）
  customId?: string; // 自定义模块的真实数据 key（来自 data-custom-id，用于区分多个自定义模块）
  rows: RowInfo[]; // 模块下的所有行
}

/**
 * 为根 div 的一级子元素绑定唯一 ID 和高度信息，供分页逻辑使用
 * @param rootRef - 测量容器的 ref（支持原生 div 或组件实例，内部通过 unrefElement 取 $el）
 * @param watchOptions - 监听选项（样式变化时触发重新测量）
 * @returns 模块 + 行信息的响应式列表
 */
export function useRowInfo(rootRef: Ref<HTMLDivElement | null>, watchOptions: any) {
  const idPrefix = "row-item";
  const selector = ".resume-module-wrapper";
  const moduleList = ref<ModuleInfo[]>([]);
  // 上一次测量的快照，用于判断行结构/高度是否真正变化
  let lastSnapshot = "";

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
        const customId = wrapper.dataset.customId || "";
        return {
          moduleKey,
          customId,
          rows: Array.from(wrapper.children, (div, index) => {
            const el = div as HTMLElement;
            const id = `${idPrefix}-${moduleKey}-${index + 1}`;
            el.id = id;
            return { id, height: rowHeight(el), element: el, index, html: el.outerHTML };
          }),
        };
      },
    );
    const snapshot = JSON.stringify(
      modules.map((m) => [m.moduleKey, m.customId, m.rows.map((r) => r.height)]),
    );
    if (snapshot !== lastSnapshot) {
      lastSnapshot = snapshot;
      moduleList.value = modules;
    }
  };
  // 防抖处理，避免连续 DOM 变化时高频执行测量
  const debouncedMeasure = useDebounceFn(measure, 100);

  // 容器挂载/重建时测量（immediate 在 ref 首次赋值时立即触发）
  watch(rootRef, debouncedMeasure, { immediate: true });
  // 容器尺寸变化（如缩放）时重新测量
  useResizeObserver(rootRef, debouncedMeasure);
  // 容器内 DOM 增删、文本变化时重新测量（内容编辑会改变高度）
  useMutationObserver(rootRef, debouncedMeasure, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  // 样式配置（字号/行高/内边距）变化会改变高度，需重新测量
  watch(watchOptions, debouncedMeasure, { deep: true });

  return { moduleList };
}
