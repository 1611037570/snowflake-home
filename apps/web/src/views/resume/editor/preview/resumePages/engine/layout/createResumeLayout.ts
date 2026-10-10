import type { PageLayoutConfig } from "../pageLayoutTypes";
import { createDefaultPageLayoutTemplate } from "./layoutTemplates";
import type { ThemeDecisions } from "@/views/resume/theme/themeDecisions";
import { EMPTY_THEME_INSET } from "@/views/resume/theme/themeContract";
import { resolveRegionSlot } from "@/views/resume/theme/regionSlots";

/** 创建当前简历使用的页面布局，单栏与多栏统一走布局模板入口。 */
export const createResumeLayout = ({
  ui,
  themeDecisions,
  moduleKeys,
  paddingVertical,
  paddingHorizontal,
  gap,
  leftColumnWidth,
}: {
  /** 用户界面配置，layout.columns 保存双栏模块顺序。 */
  ui: Record<string, any>;
  /** 主题固定版式与纸张外观。 */
  themeDecisions: ThemeDecisions;
  /** 当前存在排版节点的模块 key。 */
  moduleKeys: string[];
  /** 页面上下内边距。 */
  paddingVertical: number;
  /** 页面左右内边距。 */
  paddingHorizontal: number;
  /** 栏内节点间距。 */
  gap: number;
  /** 双栏布局的左栏宽度占比（百分比）。 */
  leftColumnWidth?: number;
}): PageLayoutConfig => {
  // 页面版式只读取主题决策，用户配置不能改变它。
  const templateId = themeDecisions.layoutType;
  const layout = createDefaultPageLayoutTemplate({
    templateId,
    moduleKeys,
    paddingVertical,
    paddingHorizontal,
    gap,
    leftWidthPercent: leftColumnWidth,
    columns: ui.layout?.columns,
  });
  // 顶部独立装饰与标语从纸张顶边排版，个人信息铺顶能力读取主题声明。
  const fullBleedRegionId = themeDecisions.topDecoration
    ? "decoration"
    : layout.regions.some((region) => region.widthMode === "page")
    ? layout.regions.find((region) => region.widthMode === "page")!.id
    : layout.regions[0]?.id === "user" && themeDecisions.regions?.user?.fillsPageTop
      ? "user"
      : null;
  // 页面上边距统一计入承载个人信息的区域上留白，不产生区域之间的外边距
  const topMarginRegionId = fullBleedRegionId
    ? layout.regions.some((region) => region.id === "user")
      ? "user"
      : "main"
    : null;
  // 个人信息与正文第一个模块之间同样是模块之间的距离，按模块上下间距在两区域之间渲染一次间隙
  const userRegionIndex = layout.regions.findIndex((region) => region.id === "user");
  const moduleGapRegionId =
    userRegionIndex >= 0 ? (layout.regions[userRegionIndex + 1]?.id ?? null) : null;
  // 装饰尺寸统一读取主题契约，区域之间的距离仅由公共模块间距结算。
  return {
    ...layout,
    fullBleedRegionId,
    regions: layout.regions.map((region) => {
      const slot = resolveRegionSlot(region.id);
      const contract = slot ? themeDecisions.regions?.[slot] : undefined;
      const padding = contract?.inset ?? EMPTY_THEME_INSET;
      // 区域之间只使用公共模块间距；装饰内边距独立声明，不能覆盖它。
      const regionGapBefore = region.id === moduleGapRegionId ? gap : 0;
      return {
        ...region,
        // 栏位由公共双栏结构确定，主题通过语义编号声明内部装饰空间。
        columns: region.columns.map((column, index) => ({
          ...column,
          ...(region.columns.length === 2 && contract?.columns
            ? { padding: contract.columns[index === 0 ? "left" : "right"] }
            : {}),
        })),
        padding:
          region.id === topMarginRegionId
            ? { ...padding, top: padding.top + paddingVertical }
            : padding,
        ...(slot ? { gapBefore: regionGapBefore } : {}),
      };
    }),
  };
};
