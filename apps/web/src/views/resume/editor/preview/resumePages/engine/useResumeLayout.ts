import { computed, type ComputedRef, type Ref } from "vue";
import { getContentHeight, RESUME_WIDTH } from "../../constants";
import { buildLayoutNodes } from "./adapter/buildLayoutNodes";
import { createResumeLayout } from "./layout/createResumeLayout";
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
  return {
    nodes,
    nodeMap,
    layout,
    validation,
    measurements,
    measureDone,
    pagePlan,
    firstFragmentIds,
    moduleKeys: activeModuleKeys,
    contentWidth,
  };
};
