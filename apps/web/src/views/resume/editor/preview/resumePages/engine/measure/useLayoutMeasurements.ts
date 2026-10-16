import { nextTick, onScopeDispose, shallowRef, ref, watch, type ComputedRef, type Ref } from "vue";
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
    source?.themeDecisions?.pageBorder?.width,
    spacing.module,
    spacing.paragraph,
    font.family,
    font.size,
    font.lineHeight,
    font.titleSize,
    theme.template,
    theme.titleTemplate,
    theme.userTemplate, // 个人信息组件切换重新测量
    theme.titleIconMode,
    source?.themeDecisions?.layoutType,
    layout.leftColumnWidth,
    JSON.stringify(layout.columns || null),
    source?.content?.language,
    source?.content?.dateStyle,
    source?.content?.datePosition,
    source?.content?.infoSeparator,
    source?.content?.textAlign,
    source?.content?.linkUnderline,
    source?.content?.subtitleCenter, // 副标题居中会改变条目的内容高度
    source?.user?.infoMode,
    source?.user?.infoLayout,
    source?.user?.avatarPosition,
    source?.user?.infoPosition,
    JSON.stringify(source?.themeDecisions?.regions || null), // 所有区域与栏几何共用完整声明，不遗漏其他槽位
    source?.themeDecisions?.topDecoration, // 独立装饰切换重新测量
    source?.themeDecisions?.usesDateRail, // 日期栏会改变正文宽度
    source?.renderSignature,
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
  const decorationHeight = ref(0); // 首页独立装饰的真实占位高度
  // 节点独立观察尺寸，宿主最小高度不变时也能捕获异步组件与图片增高。
  const resizeTargets = shallowRef<HTMLElement[]>([]);
  const measurementError = ref(""); // 主题几何或内容协议校验失败的说明
  let measuring = false;
  /** 最近一次需要重新测量的版本，合并同帧内的多次请求 */
  let dirtyAt = 0;
  /** 最近一次完成测量时对应的版本，与 dirtyAt 相同表示无需重复测量 */
  let measuredAt = 0;
  let frameHandle = 0;
  let stopped = false; // 作用域结束后不再读取宿主或回写测量
  let frameUsesTimeout = false; // 记录调度方式，使用对应取消入口
  let fullMeasurePending = true; // 宿主或排版配置变化时重新读取全部节点
  const dirtyNodeIds = new Set<string>(); // 内容和尺寸变化时只读取受影响节点
  let lastRootWidth = 0; // 宿主宽度变化会改变所有文字换行

  const measure = async (forceFull = true) => {
    if (stopped || measuring) return;
    const measuringAt = dirtyAt;
    const measureAll = forceFull || fullMeasurePending;
    const nodeIds = new Set(dirtyNodeIds);
    fullMeasurePending = false;
    dirtyNodeIds.clear();
    measuring = true;
    await nextTick();
    if (stopped) { measuring = false; return; }
    const root = unrefElement(measureRef);
    if (!root) {
      resizeTargets.value = [];
      measurements.value = new Map();
      measureDone.value = false;
      decorationHeight.value = 0;
      fullMeasurePending = true;
      measuring = false;
      return;
    }
    // 仅在节点元素发生更替时重绑观察器，避免每次测量触发初始尺寸通知。
    const nextTargets = [root, ...root.querySelectorAll<HTMLElement>("[data-layout-module], [data-layout-node-id], [data-layout-decoration]")];
    if (
      nextTargets.length !== resizeTargets.value.length ||
      nextTargets.some((element, index) => element !== resizeTargets.value[index])
    ) resizeTargets.value = nextTargets;
    let nextMeasurements: Map<string, MeasuredNode>;
    try {
      // 节点内容复用已有实测值；只读改动节点并剔除已删除节点。
      const measured = measureLayoutNodes(root, nodes.value, measureAll ? undefined : nodeIds);
      const activeIds = new Set(nodes.value.map((node) => node.id));
      nextMeasurements = measureAll ? measured : new Map(
        [...measurements.value].filter(([id]) => activeIds.has(id)),
      );
      if (!measureAll) measured.forEach((value, id) => nextMeasurements.set(id, value));
      measurementError.value = "";
    } catch (error) {
      // 失败计划不能沿用旧测量；释放调度锁，修正配置后仍可重新测量。
      measurementError.value = error instanceof Error ? error.message : String(error);
      measurements.value = new Map();
      measureDone.value = false;
      fullMeasurePending = true;
      measuredAt = measuringAt;
      measuring = false;
      if (dirtyAt !== measuringAt) scheduleMeasure();
      return;
    }
    measurements.value = nextMeasurements;
    lastRootWidth = root.getBoundingClientRect().width;
    decorationHeight.value = root.querySelector<HTMLElement>("[data-layout-decoration]")?.getBoundingClientRect().height ?? 0;
    measuredAt = measuringAt;
    measureDone.value = nodes.value.every((node) => nextMeasurements.has(node.id));
    measuring = false;
    // 测量期间又发生变更时补测一次，保证最终结果对应最新内容
    if (dirtyAt !== measuringAt) scheduleMeasure();
  };

  const scheduleMeasure = () => {
    if (stopped || frameHandle) return;
    const run = () => {
      frameHandle = 0;
      if (measuredAt === dirtyAt) return;
      void measure(false);
    };
    // 优先合并到下一帧，缺少 requestAnimationFrame 时退回宏任务
    frameUsesTimeout = typeof requestAnimationFrame !== "function";
    frameHandle = frameUsesTimeout ? window.setTimeout(run, 0) : requestAnimationFrame(run);
  };

  /** 标记测量结果过期：同步作废，实际测量合并到下一帧 */
  const requestMeasure = (nodeIds?: Iterable<string>) => {
    if (stopped) return;
    if (nodeIds) for (const id of nodeIds) dirtyNodeIds.add(id);
    else fullMeasurePending = true;
    dirtyAt += 1; // 单调版本避免同一时刻的变更被误判为已测量
    measureDone.value = false;
    measurementError.value = "";
    scheduleMeasure();
  };

  const stopWatch = watch(
    [measureRef, nodes, () => resolveWatchSignature(watchSource.value)],
    ([root, nextNodes, signature], [previousRoot, previousNodes, previousSignature]) => {
      if (root !== previousRoot || signature !== previousSignature || !previousNodes) {
        requestMeasure();
        return;
      }
      // 节点构建器会复用未改变的对象引用，按编号找出真正需要重测的节点。
      const previousById = new Map(previousNodes.map((node) => [node.id, node]));
      const changed = nextNodes.filter((node) => previousById.get(node.id) !== node).map((node) => node.id);
      requestMeasure(changed);
    },
    { immediate: true, flush: "sync" },
  );

  // 尺寸变化只重测对应模块；宿主宽度或未知元素变化仍全量测量。
  const { stop: stopResize } = useResizeObserver(resizeTargets, (entries) => {
    if (!entries?.length) { requestMeasure(); return; }
    const root = unrefElement(measureRef);
    const changed = new Set<string>();
    const hasChildEntry = entries.some((entry) => entry.target !== root);
    for (const entry of entries) {
      const target = entry.target as HTMLElement;
      if (target === root) {
        if (target.getBoundingClientRect().width !== lastRootWidth || !hasChildEntry) { requestMeasure(); return; }
        continue;
      }
      if (target.matches("[data-layout-decoration]")) continue;
      const module = target.matches("[data-layout-module]") ? target : target.closest<HTMLElement>("[data-layout-module]");
      if (module) {
        module.querySelectorAll<HTMLElement>("[data-layout-node-id]").forEach((node) => changed.add(node.dataset.layoutNodeId || ""));
      } else if (target.dataset.layoutNodeId) changed.add(target.dataset.layoutNodeId);
      else { requestMeasure(); return; }
    }
    requestMeasure(changed);
  });

  // 清理由管线绑定作用域，调用方无需手动配对。
  const stop = () => {
    if (stopped) return;
    stopped = true;
    stopWatch();
    stopResize();
    if (frameHandle) {
      if (frameUsesTimeout) window.clearTimeout(frameHandle);
      else cancelAnimationFrame(frameHandle);
      frameHandle = 0;
    }
    resizeTargets.value = [];
  };
  onScopeDispose(stop);

  return {
    measurements,
    measurementError, // 统一传给页面计划展示协议错误
    measureDone,
    decorationHeight, // 布局按实测高度扣除首页空间
    measure,
    stop, // 显式停止与作用域销毁使用同一入口
  };
};
