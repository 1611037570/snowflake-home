import { getResumeThemeTemplate, themeTemplateList } from "@/domain/resume/theme/styles";
import { resolveThemeDecisions } from "@/domain/resume/theme/themeDecisions";
import { layoutUsesColumns, resolveLayoutColumns } from "@/domain/resume/theme/layouts";
import type { ResumeUi } from "@/domain/resume/theme/uiTypes";

/** 模板卡片只对应真实主题；标题样式由各主题预设独立选择。 */
export interface ResumeStyleTemplate {
  id: string; // 主题编号，用于套用与选中状态
  localeId: string; // 模板卡片名称与说明的翻译文案编号
  design: string[]; // 设计分类标签，供模板页筛选
  ui: ResumeUi; // 主题的完整界面配置
}

export const resumeStyleTemplateList: ResumeStyleTemplate[] = themeTemplateList.map((theme) => ({
  id: theme.id,
  localeId: theme.localeId ?? theme.id,
  design: [...theme.design],
  ui: getResumeThemeTemplate(theme.id).item.ui,
}));

// 编辑器切换与模板库新建共用主题预设展开，避免两处分别计算栏位。
export const createResumeStyleUi = (preset: ResumeUi, moduleKeys: string[], language?: string): ResumeUi => {
  const ui = structuredClone(preset);
  if (language !== undefined) ui.content.language = language;
  const { layoutType } = resolveThemeDecisions(ui.theme.template);
  ui.layout.columns = layoutUsesColumns(layoutType)
    ? resolveLayoutColumns(layoutType, moduleKeys, ui.layout.columns)
    : null;
  return ui;
};
