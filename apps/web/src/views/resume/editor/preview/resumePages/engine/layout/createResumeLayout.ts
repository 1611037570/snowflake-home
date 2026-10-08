import type { PageLayoutConfig } from "../pageLayoutTypes";
import { createDefaultPageLayoutTemplate, type PageLayoutTemplateId } from "./layoutTemplates";
import { isPageLayoutTemplateId } from "@/views/resume/theme/layouts";
import { resolveRegionPadding } from "@/views/resume/theme/regionPadding";
import {
  resolveRegionFillsPageTop,
  resolveRegionGapBefore,
} from "@/views/resume/theme/components/regionContainer/registry";
import { resolveRegionSlot } from "@/views/resume/theme/regionSlots";

/**
 * 解析当前生效的布局模板编号。
 * 按 layout.type 和双栏模块 key 顺序生成布局。
 */
const resolvePageLayoutTemplate = (ui: Record<string, any>): PageLayoutTemplateId =>
  isPageLayoutTemplateId(ui.layout?.type) ? ui.layout.type : "singleColumn";

/** 创建当前简历使用的页面布局，单栏与多栏统一走布局模板入口。 */
export const createResumeLayout = ({
  ui,
  moduleKeys,
  paddingVertical,
  paddingHorizontal,
  gap,
  leftColumnWidth,
}: {
  /** 简历配置，layout.type 选择布局，layout.columns 保存双栏模块顺序。 */
  ui: Record<string, any>;
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
  const templateId = resolvePageLayoutTemplate(ui);
  const layout = createDefaultPageLayoutTemplate({
    templateId,
    moduleKeys,
    paddingVertical,
    paddingHorizontal,
    gap,
    leftWidthPercent: leftColumnWidth,
    columns: ui.layout?.columns,
  });
  // 顶部通栏区域：标语区域恒从纸张顶边开始，个人信息区域是否铺顶由组件声明
  const fullBleedRegionId = layout.regions.some((region) => region.id === "slogan")
    ? "slogan"
    : layout.regions[0]?.id === "user" && resolveRegionFillsPageTop(ui.theme?.template, "user")
      ? "user"
      : null;
  // 页面上边距统一计入承载个人信息的区域上留白，不产生区域之间的外边距
  const topMarginRegionId = fullBleedRegionId
    ? layout.regions.some((region) => region.id === "user")
      ? "user"
      : "main"
    : null;
  // 个人信息与正文第一个模块之间同样是模块之间的距离，按模块上下间距在同栏内施加一次
  const userRegionIndex = layout.regions.findIndex((region) => region.id === "user");
  const moduleGapRegionId =
    userRegionIndex >= 0 ? (layout.regions[userRegionIndex + 1]?.id ?? null) : null;
  // 各区域留白统一读取对应外观组件的尺寸，供栏宽与分页共同使用；区域之间的间距也全部来自这份留白。
  return {
    ...layout,
    fullBleedRegionId,
    regions: layout.regions.map((region) => {
      const slot = resolveRegionSlot(region.id);
      const padding = resolveRegionPadding(ui, region.id);
      return {
        ...region,
        padding:
          region.id === topMarginRegionId
            ? { ...padding, top: padding.top + paddingVertical }
            : padding,
        // 模块间距只发生在两个模块之间，因此只作用于首页
        ...(region.id === moduleGapRegionId ? { firstPagePaddingTop: gap } : {}),
        // 额外间距跟随区域组件声明，未声明表示与前一区域自然相接
        ...(slot ? { gapBefore: resolveRegionGapBefore(ui.theme?.template, slot) } : {}),
      };
    }),
  };
};
