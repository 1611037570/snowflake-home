import type { PageLayoutConfig } from "../pageLayoutTypes";
import { createDefaultPageLayoutTemplate } from "./layoutTemplates";
import type { ThemeDecisions } from "@/domain/resume/theme/themeDecisions";
import { EMPTY_THEME_INSET } from "@/domain/resume/theme/themeContract";
import { resolveRegionSlot } from "@/domain/resume/theme/regionSlots";

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
  // 个人信息与正文默认按模块间距分隔，后续由区域贴合声明决定是否保留。
  const userRegionIndex = layout.regions.findIndex((region) => region.id === "user");
  const moduleGapRegionId =
    userRegionIndex >= 0 ? (layout.regions[userRegionIndex + 1]?.id ?? null) : null;
  // 装饰尺寸统一读取主题契约，区域间距由布局结算。
  return {
    ...layout,
    fullBleedRegionId,
    regions: layout.regions.map((region) => {
      const slot = resolveRegionSlot(region.id);
      const contract = slot ? themeDecisions.regions?.[slot] : undefined;
      const padding = contract?.inset ?? EMPTY_THEME_INSET;
      // 相邻区域默认沿用模块间距，主题可声明贴合前一区域。
      const regionGapBefore = region.id === moduleGapRegionId && !contract?.joinsPrevious ? gap : 0;
      return {
        ...region,
        // 有栏间装饰时保留栏内留白，无遮饰时使用一份模块间距作为栏外间距。
        ...(region.columns.length === 2 && !contract?.columnDecoration
          ? { columnGap: gap }
          : {}),
        columns: region.columns.map((column, index) => ({
          ...column,
          // 分隔线或栏背景占据中缝时，两栏内容各向内留完整页面边距。
          ...(region.columns.length === 2 && contract?.columnDecoration
            ? { padding: index === 0
              ? { left: 0, right: paddingHorizontal }
              : { left: paddingHorizontal, right: 0 } }
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
