import { computed, type ComputedRef, type Ref } from "vue";
import { getContentHeight, RESUME_WIDTH } from "../../shared/constants";
import { defaultLeftColumnWidth } from "@/stores/modules/resume/config/uiConfig";
import { buildLayoutNodes } from "./adapter/buildLayoutNodes";
import { createResumeLayout } from "./layout/createResumeLayout";
import { buildRegionFlows } from "./layout/regionFlows";
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
  /** 正文容器的单侧内边距，单位为像素。 */
  viewPadding: ComputedRef<number>;
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
  viewPadding,
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
    getContentHeight(Number(ui.value.page?.padding?.vertical) || 0, showPageNumber.value),
  );
  const layout = computed<PageLayoutConfig>(() =>
    createResumeLayout({
      ui: ui.value,
      moduleKeys: activeModuleKeys.value,
      paddingVertical: Number(ui.value.page?.padding?.vertical) || 0,
      paddingHorizontal: Number(ui.value.page?.padding?.horizontal) || 0,
      gap: Number(ui.value.page?.spacing?.module) || 0,
      leftColumnWidth: Number(ui.value.layout?.leftColumnWidth) || defaultLeftColumnWidth,
      viewPadding: viewPadding.value,
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
      ? [
          {
            code: "invalidLayout" as const,
            message: `布局配置数值错误：${validation.value.invalidLayoutFields.join("、")}`,
          },
        ]
      : []),
  ]);
  const contentWidth = computed(
    () => RESUME_WIDTH - (Number(ui.value.page?.padding?.horizontal) || 0) * 2,
  );
  // 栏宽解析只做一次：测量宿主与真实渲染共用同一份栏宽，避免两处各算一遍
  const columnWidths = computed(() => resolveColumnWidths(layout.value, contentWidth.value));
  // 测量宿主按栏位分组渲染：每个节点在自己的栏宽下测量，节点与栏位一一对应，测量结果仍是扁平表
  // 分组带上区域编号，测量树才能用同一份区域外观渲染（长图导出即取自该树）
  const measureGroups = computed(() =>
    layout.value.regions.flatMap((region) =>
      region.columns.map((column) => ({
        id: column.id,
        regionId: region.id,
        width: columnWidths.value.get(column.id) ?? contentWidth.value,
        nodes: nodes.value.filter((node) => column.moduleKeys.includes(node.sourceModuleKey)),
      })),
    ),
  );
  const watchSource = computed(() => ({
    page: ui.value.page,
    pageSpacing: {
      module: ui.value.page?.spacing?.module,
      paragraph: ui.value.page?.spacing?.paragraph,
    },
    font: ui.value.font,
    theme: ui.value.theme,
    themeTemplate: ui.value.theme?.template, // 标题风格切换会改变标题高度
    layout: ui.value.layout,
    viewPadding: viewPadding.value, // 容器内边距变化会改变隐藏测量宽度
    fontReadyVersion: fontReadyVersion.value,
  }));
  const { measurements, measureDone } = useLayoutMeasurements({
    measureRef,
    nodes,
    watchSource,
  });
  /** 最近一次成功生成的页面计划：测量期间继续沿用它，避免页面树被卸载重挂 */
  let lastValidPlan: PagePlan | null = null;
  const nextPagePlan = computed<PagePlan | null>(() => {
    if (!validation.value.valid || nodes.value.length === 0) {
      return {
        status: validation.value.valid ? "ready" : "invalid",
        version: fontReadyVersion.value,
        pages: [],
        warnings: validationWarnings.value,
      };
    }
    if (!measureDone.value) return null;
    const orderedRegions = [...layout.value.regions].sort(
      (left, right) => left.order - right.order,
    );
    // 区域高度循环由纯函数结算，测量结果与分页算法只通过回调接入
    const { columnFlows: flowPagesByColumn } = buildRegionFlows<ReturnType<typeof paginateFlow>>(
      orderedRegions,
      {
        availableHeight: availableHeight.value,
        regionGap: layout.value.regionGap,
        buildFlow: (column, { heights }) => {
          const columnNodes = nodes.value.filter((node) =>
            column.moduleKeys.includes(node.sourceModuleKey),
          );
          return paginateFlow({
            nodes: columnNodes,
            measurements: measurements.value,
            heights,
            gap: column.gap,
          });
        },
      },
    );
    return buildPagePlan({
      layout: layout.value,
      availableHeight: availableHeight.value,
      flowPagesByColumn,
      version: fontReadyVersion.value,
    });
  });
  const pagePlan = computed<PagePlan>(() => {
    const next = nextPagePlan.value;
    if (next) {
      lastValidPlan = next;
      return next;
    }
    // 测量期间沿用上一次的有效计划：置空会让整棵页面树卸载再重挂，容器高度塌到零，输入时界面持续闪动
    return (
      lastValidPlan ?? {
        status: "ready",
        version: fontReadyVersion.value,
        pages: [],
        warnings: [],
      }
    );
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
