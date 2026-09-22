import { RESUME_HEIGHT, RESUME_WIDTH } from "../../../constants";
import type { PageLayoutConfig } from "../pageLayoutTypes";
import { createSingleColumnLayout } from "./createSingleColumnLayout";
import {
  createDefaultPageLayoutTemplate,
  type PageLayoutTemplateId,
} from "./layoutTemplates";

/** 创建当前简历使用的页面布局。 */
export const createResumeLayout = ({
  ui,
  moduleKeys,
  paddingVertical,
  paddingHorizontal,
  gap,
}: {
  /** 简历主题配置，pageLayout 是唯一的显式布局入口。 */
  ui: Record<string, any>;
  /** 当前存在排版节点的模块 key。 */
  moduleKeys: string[];
  /** 页面上下内边距。 */
  paddingVertical: number;
  /** 页面左右内边距。 */
  paddingHorizontal: number;
  /** 单栏节点间距。 */
  gap: number;
}): PageLayoutConfig => {
  if (
    ui.pageLayoutTemplate &&
    ui.themeTemplate === ui.pageLayoutTemplate &&
    ["topUserTwoColumn", "twoColumn"].includes(ui.pageLayoutTemplate)
  ) {
    return createDefaultPageLayoutTemplate({
      templateId: ui.pageLayoutTemplate as PageLayoutTemplateId,
      moduleKeys,
      paddingVertical,
      paddingHorizontal,
      gap,
    });
  }

  const explicitLayout = ui.pageLayout;
  if (explicitLayout && Array.isArray(explicitLayout.regions)) {
    return explicitLayout as PageLayoutConfig;
  }

  return createSingleColumnLayout({
    moduleKeys,
    pageSize: { width: RESUME_WIDTH, height: RESUME_HEIGHT },
    pagePadding: {
      top: paddingVertical,
      right: paddingHorizontal,
      bottom: paddingVertical,
      left: paddingHorizontal,
    },
    gap,
    regionGap: 0,
  });
};
