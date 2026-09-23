import { computed, type ComputedRef, type Ref } from "vue";
import { getContentHeight, RESUME_WIDTH } from "../../constants";
import { defaultLeftColumnWidth } from "@/stores/modules/resume/uiConfig";
import { buildLayoutNodes } from "./adapter/buildLayoutNodes";
import { createResumeLayout } from "./layout/createResumeLayout";
import { resolveColumnWidths } from "./layout/resolveColumnWidths";
import { validateLayoutConfig } from "./layout/validateLayoutConfig";
import { useLayoutMeasurements } from "./measure/useLayoutMeasurements";
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
  /** 是否为缩略图模式。 */
  isThumb: ComputedRef<boolean> | Ref<boolean>;
}

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
  isThumb,
}: UseResumeLayoutOptions) => {
  const moduleKeys = computed(() => allModules.value.map((module) => module.key).filter(Boolean));
  const nodes = computed<LayoutNode[]>(() => {
    const built = buildLayoutNodes({
      moduleKeys: moduleKeys.value,
      data: data.value,
      ui: ui.value,
    });
    // 缩略图只需首屏观感，跳过字符级断点，避免每张卡片挂载一棵过大的测量树
    if (!isThumb.value) return built;
    return built.map((node) =>
      node.breakPoints
        ? { ...node, breakPoints: node.breakPoints.filter((point) => point.type !== "char") }
        : node,
    );
  });
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
      leftColumnWidth: Number(ui.value.leftColumnWidth) || defaultLeftColumnWidth,
    }),
  );
  const validation = computed(() => validateLayoutConfig(layout.value, activeModuleKeys.value));
  const validationWarnings = computed(() => [
    ...validation.value.missingModuleKeys.map((moduleKey) => ({
      code: "missingColumn" as const,
      message: `模块 ${moduleKey} 没有明确分配到栏位`,
    })),
    ...validation.value.duplicateModuleKeys.map((moduleKey) => ({
      code: "invalidLayout" as const,
      message: `模块 ${moduleKey} 被重复分配到多个栏位`,
    })),
    ...validation.value.unknownModuleKeys.map((moduleKey) => ({
      code: "invalidLayout" as const,
      message: `布局配置包含不存在的模块 ${moduleKey}`,
    })),
    ...validation.value.duplicateRegionIds.map((regionId) => ({
      code: "invalidLayout" as const,
      message: `页面区域编号重复：${regionId}`,
    })),
    ...validation.value.duplicateColumnIds.map((columnId) => ({
      code: "invalidLayout" as const,
      message: `页面栏编号重复：${columnId}`,
    })),
    ...(validation.value.invalidLayoutFields.length > 0
      ? [{
          code: "invalidLayout" as const,
          message: `布局配置数值错误：${validation.value.invalidLayoutFields.join("、")}`,
        }]
      : []),
  ]);
  const contentWidth = computed(
    () => RESUME_WIDTH - (Number(ui.value.paddingHorizontal) || 0) * 2,
  );
  // 栏宽解析只做一次：测量宿主与真实渲染共用同一份栏宽，避免两处各算一遍
  const columnWidths = computed(() => resolveColumnWidths(layout.value, contentWidth.value));
  // 测量宿主按栏位分组渲染：每个节点在自己的栏宽下测量，节点与栏位一一对应，测量结果仍是扁平表
  const measureGroups = computed(() =>
    layout.value.regions.flatMap((region) =>
      region.columns.map((column) => ({
        id: column.id,
        width: columnWidths.value.get(column.id) ?? contentWidth.value,
        nodes: nodes.value.filter((node) => column.moduleKeys.includes(node.sourceModuleKey)),
      })),
    ),
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
        warnings: validationWarnings.value,
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
    const orderedRegions = [...layout.value.regions].sort((left, right) => left.order - right.order);
    const flowPagesByColumn = new Map<string, ReturnType<typeof paginateFlow>>();
    let firstPageConsumedHeight = 0;

    orderedRegions.forEach((region, regionIndex) => {
      const firstPageAvailableHeight = Math.max(
        0,
        availableHeight.value - firstPageConsumedHeight,
      );
      const regionFlows = region.columns.map((column) => {
        const columnNodes = nodes.value.filter((node) =>
          column.moduleKeys.includes(node.sourceModuleKey),
        );
        const flowPages = paginateFlow({
          nodes: columnNodes,
          measurements: measurements.value,
          availableHeight: firstPageAvailableHeight,
          availableHeightByPage: (pageIndex) =>
            pageIndex === 0 ? firstPageAvailableHeight : availableHeight.value,
          gap: column.gap,
        });
        flowPagesByColumn.set(column.id, flowPages);
        return flowPages;
      });

      const firstPageRegionHeight = Math.max(
        ...regionFlows.map((flowPages) => flowPages[0]?.usedHeight || 0),
        0,
      );
      if (region.height.mode === "auto") {
        firstPageConsumedHeight += firstPageRegionHeight;
      } else if (region.height.mode === "fixed") {
        firstPageConsumedHeight += region.height.value;
      } else {
        firstPageConsumedHeight = availableHeight.value;
      }

      if (regionIndex < orderedRegions.length - 1) {
        firstPageConsumedHeight += Math.max(0, layout.value.regionGap);
      }
    });
    return buildPagePlan({
      layout: layout.value,
      availableHeight: availableHeight.value,
      flowPagesByColumn,
      version: fontReadyVersion.value,
    });
  });
  const nodeMap = computed(() => new Map(nodes.value.map((node) => [node.id, node])));
  return {
    nodes,
    nodeMap,
    layout,
    validation,
    measurements,
    measureDone,
    pagePlan,
    moduleKeys: activeModuleKeys,
    contentWidth,
    columnWidths,
    measureGroups,
  };
};
