import { nextTick, shallowRef, ref, watch, type ComputedRef, type Ref } from "vue";
import { unrefElement, useResizeObserver } from "@vueuse/core";
import type { LayoutNode } from "../types";
import { measureLayoutNodes } from "./measureLayoutNodes";
import type { MeasuredNode } from "./types";

/** 排版测量管线参数。 */
export interface UseLayoutMeasurementsOptions {
  /** 隐藏测量宿主元素。 */
  measureRef: Ref<HTMLElement | null>;
  /** 当前需要测量的排版节点。 */
  nodes: ComputedRef<LayoutNode[]>;
  /** 会改变字体、宽度或内容高度的响应式配置。 */
  watchSource: ComputedRef<Record<string, any>>;
}

/**
 * 判断会改变测量结果的配置是否真的变化。
 * 配置对象每次渲染都是新引用，直接深度监听会在一帧内被触发多次，
 * 这里只比较会改变高度与宽度的字段，避免同一次输入反复重测量。
 */
const resolveWatchSignature = (source: Record<string, any>): string => {
  const page = source?.page ?? {};
  const spacing = page.spacing ?? {};
  const font = source?.font ?? {};
  const theme = source?.theme ?? {};
  const layout = source?.layout ?? {};
  return [
    page.padding?.vertical,
    page.padding?.horizontal,
    spacing.module,
    spacing.paragraph,
    font.family,
    font.size,
    font.lineHeight,
    font.titleSize,
    theme.template,
    layout.type,
    layout.leftColumnWidth,
    source?.viewPadding,
    source?.fontReadyVersion,
  ].join("|");
};

/**
 * 监听测量宿主并输出节点测量结果。
 * 分页引擎只读取这里的 Map，不会接触 DOM 或观察器。
 * 同一帧内的多次请求会合并成一次测量，测量完成后才重新排版，避免输入过程中反复测量。
 */
export const useLayoutMeasurements = ({
  measureRef,
  nodes,
  watchSource,
}: UseLayoutMeasurementsOptions) => {
  const measurements = shallowRef<ReadonlyMap<string, MeasuredNode>>(new Map());
  const measureDone = ref(false);
  let measuring = false;
  /** 最近一次需要重新测量的时间戳，合并同帧内的多次请求 */
  let dirtyAt = 0;
  /** 最近一次完成测量时对应的时间戳，与 dirtyAt 相同表示无需重复测量 */
  let measuredAt = 0;
  let frameHandle = 0;

  const measure = async () => {
    if (measuring) return;
    const measuringAt = dirtyAt;
    measuring = true;
    await nextTick();
    const root = unrefElement(measureRef);
    if (!root) {
      measurements.value = new Map();
      measureDone.value = false;
      measuring = false;
      return;
    }
    const nextMeasurements = measureLayoutNodes(root, nodes.value);
    measurements.value = nextMeasurements;
    measuredAt = measuringAt;
    measureDone.value = nodes.value.every((node) => nextMeasurements.has(node.id));
    measuring = false;
    // 测量期间又发生变更时补测一次，保证最终结果对应最新内容
    if (dirtyAt !== measuringAt) scheduleMeasure();
  };

  const scheduleMeasure = () => {
    if (frameHandle) return;
    const run = () => {
      frameHandle = 0;
      if (measuredAt === dirtyAt) return;
      void measure();
    };
    // 优先合并到下一帧，缺少 requestAnimationFrame 时退回宏任务
    if (typeof requestAnimationFrame === "function") frameHandle = requestAnimationFrame(run);
    else frameHandle = window.setTimeout(run, 0);
  };

  /** 标记测量结果过期：同步作废，实际测量合并到下一帧 */
  const requestMeasure = () => {
    dirtyAt = performance.now();
    measureDone.value = false;
    scheduleMeasure();
  };

  const stopWatch = watch(
    [measureRef, nodes, () => resolveWatchSignature(watchSource.value)],
    () => requestMeasure(),
    { immediate: true, flush: "sync" },
  );

  // 尺寸变化由浏览器报告，与图谱变更一并合并到同一帧测量
  const { stop: stopResize } = useResizeObserver(measureRef, () => requestMeasure());

  return {
    measurements,
    measureDone,
    measure,
    stop: () => {
      stopWatch();
      stopResize();
      if (frameHandle) {
        cancelAnimationFrame(frameHandle);
        frameHandle = 0;
      }
    },
  };
};
