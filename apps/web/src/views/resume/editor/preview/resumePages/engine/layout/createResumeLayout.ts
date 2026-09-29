import type { PageLayoutConfig } from "../pageLayoutTypes";
import {
  createDefaultPageLayoutTemplate,
  type PageLayoutTemplateId,
} from "./layoutTemplates";
import { isPageLayoutTemplateId } from "@/views/resume/theme/layouts";

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
  return createDefaultPageLayoutTemplate({
    templateId,
    moduleKeys,
    paddingVertical,
    paddingHorizontal,
    gap,
    leftWidthPercent: leftColumnWidth,
    columns: ui.layout?.columns,
  });
};
