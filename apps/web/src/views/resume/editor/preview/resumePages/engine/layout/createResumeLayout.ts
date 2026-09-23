import type { PageLayoutConfig } from "../pageLayoutTypes";
import {
  createDefaultPageLayoutTemplate,
  type PageLayoutTemplateId,
} from "./layoutTemplates";

/** 布局型主题模板：只有这几个编号会参与模板推导 */
const LAYOUT_TEMPLATE_IDS: PageLayoutTemplateId[] = ["topUserTwoColumn", "twoColumn"];

/**
 * 解析当前生效的布局模板编号。
 * 显式 ui.pageLayout 优先，保证用户手动调整过的栏位不被主题模板覆盖；
 * 否则布局模板由主题带入，主题与模板一致时才生效，避免切换主题后残留上一套布局。
 */
const resolvePageLayoutTemplate = (ui: Record<string, any>): PageLayoutTemplateId | null => {
  if (ui.pageLayout && Array.isArray(ui.pageLayout.regions)) return null;
  const templateId = ui.pageLayoutTemplate;
  if (LAYOUT_TEMPLATE_IDS.includes(templateId) && ui.themeTemplate === templateId) {
    return templateId as PageLayoutTemplateId;
  }
  return "single";
};

/** 创建当前简历使用的页面布局，单栏与多栏统一走布局模板入口。 */
export const createResumeLayout = ({
  ui,
  moduleKeys,
  paddingVertical,
  paddingHorizontal,
  gap,
  leftColumnWidth,
}: {
  /** 简历主题配置，pageLayoutTemplate 决定布局模板，pageLayout 是显式布局入口。 */
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
  if (templateId) {
    return createDefaultPageLayoutTemplate({
      templateId,
      moduleKeys,
      paddingVertical,
      paddingHorizontal,
      gap,
      leftWidthPercent: leftColumnWidth,
    });
  }
  return ui.pageLayout as PageLayoutConfig;
};
