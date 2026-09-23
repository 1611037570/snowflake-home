import {
  nextTick,
  shallowRef,
  ref,
  watch,
  type ComputedRef,
  type Ref,
  type WatchSource,
} from "vue";
import {
  unrefElement,
  useDebounceFn,
  useMutationObserver,
  useResizeObserver,
} from "@vueuse/core";
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
  watchSource: WatchSource<unknown>;
}

/**
 * 监听测量宿主并输出节点测量结果。
 * 分页引擎只读取这里的 Map，不会接触 DOM 或观察器。
 */
export const useLayoutMeasurements = ({
  measureRef,
  nodes,
  watchSource,
}: UseLayoutMeasurementsOptions) => {
  const measurements = shallowRef<ReadonlyMap<string, MeasuredNode>>(new Map());
  const measureDone = ref(false);
  let measuring = false;

  const measure = async () => {
    if (measuring) return;
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
    measureDone.value = nodes.value.every(
      (node) => nextMeasurements.has(node.id) && (!node.title || nextMeasurements.has(node.title.id)),
    );
    measuring = false;
  };

  const scheduleMeasure = useDebounceFn(() => {
    void measure();
  }, 0);
  // 节点更新后先同步作废旧测量结果，避免分页用旧 Map 处理新节点
  const requestMeasure = () => {
    measureDone.value = false;
    void scheduleMeasure();
  };

  watch([measureRef, nodes, watchSource], requestMeasure, {
    immediate: true,
    flush: "sync",
  });

  const { stop: stopMutation } = useMutationObserver(measureRef, requestMeasure, {
    childList: true,
    subtree: true,
  });
  const { stop: stopResize } = useResizeObserver(measureRef, requestMeasure);

  return {
    measurements,
    measureDone,
    measure,
    stop: () => {
      stopMutation();
      stopResize();
    },
  };
};
