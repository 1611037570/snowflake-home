import { computed, type ComputedRef, type Ref } from "vue";
import { getContentHeight, RESUME_WIDTH } from "../../constants";
import { buildLayoutNodes } from "./adapter/buildLayoutNodes";
import { createResumeLayout } from "./layout/createResumeLayout";
import { validateLayoutConfig } from "./layout/validateLayoutConfig";
import { useLayoutMeasurements } from "./measure/useLayoutMeasurements";
import type { MeasuredNode } from "./measure/types";
import { buildPagePlan } from "./paginate/pagePlan";
import { paginateFlow } from "./paginate/paginateFlow";
import type { PagePlan } from "./paginate/pagePlan";
import type { PageLayoutConfig } from "./pageLayoutTypes";
import type { LayoutNode } from "./types";

/** 新排版链路的接入参数。 */
export interface UseResumeLayoutOptions {
  /** 真实隐藏测量宿主元素。 */
  measureRef: Ref<HTMLElement | null>;
  /** 简历业务数据。 */
  data: ComputedRef<Record<string, unknown>>;
  /** 当前简历字段配置展开后的模块顺序。 */
  allModules: ComputedRef<any[]>;
  /** 简历主题配置。 */
  ui: ComputedRef<Record<string, any>>;
  /** 是否展示页码。 */
  showPageNumber: ComputedRef<boolean>;
  /** 字体加载版本。 */
  fontReadyVersion: Ref<number>;
}

/** 将新分页计划转换为旧智能一页功能暂时需要的模块高度快照。 */
const buildModuleList = (
  nodes: LayoutNode[],
  measurements: ReadonlyMap<string, MeasuredNode>,
) => {
  const list = new Map<string, any>();
  nodes.forEach((node) => {
    const measurement = measurements.get(node.id);
    if (!measurement) return;
    const current = list.get(node.sourceModuleKey) || {
      moduleKey: node.sourceModuleKey,
      rows: [],
    };
    current.rows.push({
      height: measurement.fullHeight,
      margin: 0,
      index: current.rows.length,
      selector: `:nth-child(${current.rows.length + 1})`,
    });
    list.set(node.sourceModuleKey, current);
  });
  return [...list.values()];
};

/**
 * 新预览排版接线层。
 * 负责组装各层数据，不在这里实现具体分页规则。
 */
export const useResumeLayout = ({
  measureRef,
  data,
  allModules,
  ui,
  showPageNumber,
  fontReadyVersion,
}: UseResumeLayoutOptions) => {
  const moduleKeys = computed(() => allModules.value.map((module) => module.key).filter(Boolean));
  const nodes = computed(() =>
    buildLayoutNodes({
      moduleKeys: moduleKeys.value,
      data: data.value,
      ui: ui.value,
    }),
  );
  const activeModuleKeys = computed(() => [
    ...new Set(nodes.value.map((node) => node.sourceModuleKey)),
  ]);
  const availableHeight = computed(() =>
    getContentHeight(Number(ui.value.paddingVertical) || 0, showPageNumber.value),
  );
  const layout = computed<PageLayoutConfig>(() =>
    createResumeLayout({
      ui: ui.value,
      moduleKeys: activeModuleKeys.value,
      paddingVertical: Number(ui.value.paddingVertical) || 0,
      paddingHorizontal: Number(ui.value.paddingHorizontal) || 0,
      gap: Number(ui.value.moduleSpacing) || 0,
    }),
  );
  const validation = computed(() => validateLayoutConfig(layout.value, activeModuleKeys.value));
  const contentWidth = computed(
    () => RESUME_WIDTH - (Number(ui.value.paddingHorizontal) || 0) * 2,
  );
  const watchSource = computed(() => ({
    paddingVertical: ui.value.paddingVertical,
    paddingHorizontal: ui.value.paddingHorizontal,
    fontSize: ui.value.fontSize,
    titleFontSize: ui.value.titleFontSize,
    lineHeight: ui.value.lineHeight,
    paragraphSpacing: ui.value.paragraphSpacing,
    moduleContent: ui.value.moduleContent,
    moduleSpacing: ui.value.moduleSpacing,
    themeTemplate: ui.value.themeTemplate,
    fontReadyVersion: fontReadyVersion.value,
  }));
  const { measurements, measureDone } = useLayoutMeasurements({
    measureRef,
    nodes,
    watchSource,
  });
  const pagePlan = computed<PagePlan>(() => {
    if (!validation.value.valid || nodes.value.length === 0) {
      return {
        status: validation.value.valid ? "ready" : "invalid",
        version: fontReadyVersion.value,
        pages: [],
        warnings: validation.value.missingModuleKeys.map((moduleKey) => ({
          code: "missingColumn" as const,
          message: `模块 ${moduleKey} 没有明确分配到栏位`,
        })),
      };
    }
    if (!measureDone.value) {
      return {
        status: "ready",
        version: fontReadyVersion.value,
        pages: [],
        warnings: [],
      };
    }
    const flowPagesByColumn = new Map(
      layout.value.regions.flatMap((region) =>
        region.columns.map((column) => [
          column.id,
          paginateFlow({
            nodes: nodes.value.filter((node) => column.moduleKeys.includes(node.sourceModuleKey)),
            measurements: measurements.value,
            availableHeight: availableHeight.value,
            gap: column.gap,
          }),
        ] as const),
      ),
    );
    return buildPagePlan({
      layout: layout.value,
      availableHeight: availableHeight.value,
      flowPagesByColumn,
      version: fontReadyVersion.value,
    });
  });
  const nodeMap = computed(() => new Map(nodes.value.map((node) => [node.id, node])));
  const firstFragmentIds = computed(() => {
    const result = new Set<string>();
    const seenModules = new Set<string>();
    pagePlan.value.pages.forEach((page) =>
      page.regions.forEach((region) =>
        region.columns.forEach((column) =>
          column.fragments.forEach((fragment) => {
            if (seenModules.has(fragment.sourceModuleKey)) return;
            seenModules.add(fragment.sourceModuleKey);
            result.add(fragment.fragmentId);
          }),
        ),
      ),
    );
    return result;
  });
  const moduleList = computed(() => buildModuleList(nodes.value, measurements.value));

  return {
    nodes,
    nodeMap,
    layout,
    validation,
    measurements,
    measureDone,
    pagePlan,
    firstFragmentIds,
    moduleList,
    contentWidth,
  };
};
