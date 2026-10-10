import type { ThemeDecisions } from "@/views/resume/theme/themeDecisions";
import { computed, type ComputedRef, type Ref } from "vue";
import { getContentHeight, RESUME_WIDTH } from "../../shared/constants";
import { defaultLeftColumnWidth } from "@/stores/modules/resume/config/uiConfig";
import { createLayoutNodeBuilder } from "./adapter/buildLayoutNodes";
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
  /** 当前主题固定版式与纸张外观。 */
  themeDecisions: ComputedRef<ThemeDecisions>;
  /** 是否展示页码。 */
  showPageNumber: ComputedRef<boolean>;
  /** 字体加载版本。 */
  fontReadyVersion: Ref<number>;
  /** 节点之外仍会影响渲染尺寸的个人信息字段签名。 */
  renderSignature: ComputedRef<string>;
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
  themeDecisions,
  showPageNumber,
  fontReadyVersion,
  renderSignature,
  isThumb,
}: UseResumeLayoutOptions) => {
  const buildNodes = createLayoutNodeBuilder(); // 节点复用与注册表归当前预览实例管理
  const moduleKeys = computed(() => allModules.value.map((module) => module.key).filter(Boolean));
  const nodes = computed<LayoutNode[]>(() => {
    const built = buildNodes({
      moduleKeys: moduleKeys.value,
      data: data.value,
      ui: ui.value,
    }).map((node) => node.contentKind === "user"
      ? { ...node, splitMode: themeDecisions.value.userContent?.split ?? "whole" } // 组件分片能力显式进入测量契约
      : node);
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
  // 纸张边框宽度：参与页面内容宽高，渲染层与测量宿主都用同一份取值
  const pageBorderWidth = computed(() => Math.max(0, Number(themeDecisions.value.pageBorder.width) || 0));
  const pageTop = computed(() => Number(ui.value.page?.padding?.vertical) || 0);
  const laterPageAvailableHeight = computed(() =>
    getContentHeight(pageTop.value, showPageNumber.value, pageBorderWidth.value),
  );
  const layout = computed<PageLayoutConfig>(() =>
    createResumeLayout({
      ui: ui.value,
      themeDecisions: themeDecisions.value, // 主题决定页面版式
      moduleKeys: activeModuleKeys.value,
      paddingVertical: Number(ui.value.page?.padding?.vertical) || 0,
      paddingHorizontal: Number(ui.value.page?.padding?.horizontal) || 0,
      gap: Number(ui.value.page?.spacing?.module) || 0,
      leftColumnWidth: Number(ui.value.layout?.leftColumnWidth) || defaultLeftColumnWidth,
    }),
  );
  // 顶部通栏区域由布局统一判定，首屏可用高度据此补回被它覆盖的页面上边距
  const fullBleedTopRegionId = computed(() => layout.value.fullBleedRegionId ?? null);
  const availableHeight = computed(() =>
    Math.max(0, laterPageAvailableHeight.value + (fullBleedTopRegionId.value ? pageTop.value : 0) - decorationHeight.value),
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
  // 页面内容宽度：整页宽扣掉纸张边框与左右页边距
  const contentWidth = computed(
    () =>
      RESUME_WIDTH -
      pageBorderWidth.value * 2 -
      (Number(ui.value.page?.padding?.horizontal) || 0) * 2,
  );
  // 栏宽解析只做一次：测量宿主与真实渲染共用同一份栏宽，避免两处各算一遍
  // 标语栏使用纸张内圈全宽，其他栏沿用页面左右留白后的内容宽度。
  const columnWidths = computed(() =>
    resolveColumnWidths(layout.value, contentWidth.value, RESUME_WIDTH - pageBorderWidth.value * 2),
  );
  // 节点只按模块索引一次，栏内有序列表由测量与分页共同复用。
  const nodesByModule = computed(() => {
    const index = new Map<string, LayoutNode[]>();
    for (const node of nodes.value) {
      const list = index.get(node.sourceModuleKey);
      if (list) list.push(node);
      else index.set(node.sourceModuleKey, [node]);
    }
    return index;
  });
  const nodesByColumn = computed(() => new Map(
    layout.value.regions.flatMap((region) => region.columns.map((column) => [
      column.id,
      column.moduleKeys.flatMap((moduleKey) => nodesByModule.value.get(moduleKey) ?? []),
    ] as const)),
  ));
  // 测量宿主按栏位分组渲染：每个节点在自己的栏宽下测量，节点与栏位一一对应，测量结果仍是扁平表
  // 分组带上区域编号，测量树才能用同一份区域外观渲染（长图导出即取自该树）
  const measureGroups = computed(() =>
    layout.value.regions.flatMap((region) =>
      region.columns.map((column) => ({
        id: column.id,
        regionId: region.id,
        width: columnWidths.value.get(column.id) ?? contentWidth.value,
        padding: column.padding, // 测量栏与预览栏共用装饰内边距
        // 测量节点按栏内模块顺序排列，保持模块内部节点顺序。
        nodes: nodesByColumn.value.get(column.id) ?? [],
      })),
    ),
  );
  const watchSource = computed(() => ({
    page: ui.value.page,
    themeDecisions: themeDecisions.value, // 边框与版式变化触发重新测量
    font: ui.value.font,
    theme: ui.value.theme,
    content: ui.value.content,
    user: ui.value.user,
    layout: ui.value.layout,
    renderSignature: renderSignature.value,
    fontReadyVersion: fontReadyVersion.value,
  }));
  const { measurements, measureDone, decorationHeight, measurementError } = useLayoutMeasurements({
    measureRef,
    nodes,
    watchSource,
  });
  /** 最近一次成功生成的页面计划：测量期间继续沿用它，避免页面树被卸载重挂 */
  let lastValidPlan: PagePlan | null = null;
  const nextPagePlan = computed<PagePlan | null>(() => {
    if (measurementError?.value) return {
      status: "invalid", // 协议失败不作为空白正常页面展示
      version: fontReadyVersion.value, // 当前字体版本
      pages: [], // 不输出错误内容
      warnings: [{ code: "invalidLayout", message: measurementError.value }], // 显示问题模块或节点
    };
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
        laterPageAvailableHeight: laterPageAvailableHeight.value,
        buildFlow: (column, { heights }) => {
          // 分页沿用栏内模块顺序，使双栏上下移动实际改变页面内容。
          return paginateFlow({
            nodes: nodesByColumn.value.get(column.id) ?? [],
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
      nodes: nodes.value, // 按原始内容检查输出完整性
      measurements: measurements.value, // 与分页共用同一次测量
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
    fullBleedTopRegionId,
    contentWidth,
    columnWidths,
    measureGroups,
  };
};
