import { getResumeThemeTemplate, themeTemplateList } from "@/domain/resume/theme/styles";
import { standaloneTitleStyleList, type TitleStyleDefinition } from "@/domain/resume/theme/titleStyles";
import type { ResumeUi } from "@/domain/resume/theme/uiTypes";

/**
 * 样式模板清单 —— 简历模板库中样式卡片的唯一数据源。
 *
 * 模板分两类：主题模板携带整套配色与版式；标题样式模板只表达标题怎么画，
 * 并各自带上该样式的主题色与页面留白，套用默认主题的其余配置。
 * 一种标题样式只出一张卡片：极简主题表达的只是"只有标题不同"，由标题样式模板承载，
 * 极简分类只展示可独立使用的标题样式。
 */
export interface ResumeStyleTemplate {
  id: string; // 模板编号，主题模板取主题编号，标题样式模板取标题样式编号
  design: string[]; // 设计分类标签，取值与主题 design 同一套，供模板页筛选
  ui: ResumeUi; // 套用该模板时写入简历的完整界面配置
}

// 标题样式模板的底板主题：只借版式与基础配色，标题、主题色与页面留白交给标题样式
const TITLE_TEMPLATE_BASE_THEME = "default";

// 标题样式只表达标题一行怎么画，统一归入极简分类
const TITLE_TEMPLATE_DESIGN = ["single-column", "plain"];

// 标题样式模板：默认主题配置叠加该样式自己的标题参数、主题色与页面留白。
// 极简分类里的卡片若只换标题样式，颜色与边距会完全一致，因此每个样式都带上自己的配置。
const resolveTitleStyleUi = (style: TitleStyleDefinition): ResumeUi => {
  // 每次取预设都返回独立副本，避免各标题样式模板之间共享同一份配置对象
  const base = getResumeThemeTemplate(TITLE_TEMPLATE_BASE_THEME).item.ui;
  return {
    ...base,
    font: { ...base.font, titleSize: style.titleSize ?? base.font.titleSize },
    page: {
      ...base.page,
      // 页面边距只覆盖标题样式声明的两个方向，间距按需覆盖，其余沿用底板主题
      padding: { ...base.page.padding, ...style.padding },
      spacing: { ...base.page.spacing, ...style.spacing },
    },
    theme: {
      ...base.theme,
      color: style.color,
      titleIconMode: style.titleIconMode ?? base.theme.titleIconMode,
      titleTemplate: style.id,
    },
  };
};

const titleStyleTemplates: ResumeStyleTemplate[] = standaloneTitleStyleList.map((style) => ({
  id: style.id,
  design: [...TITLE_TEMPLATE_DESIGN],
  ui: resolveTitleStyleUi(style),
}));

// 主题模板：主题预设本身就是模板配置；极简主题只表达一种标题样式，由标题样式模板出卡，避免重复
const themeStyleTemplates: ResumeStyleTemplate[] = themeTemplateList
  .filter((theme) => !theme.design.includes("plain"))
  .map((theme) => ({
    id: theme.id,
    design: [...theme.design],
    ui: getResumeThemeTemplate(theme.id).item.ui,
  }));

export const resumeStyleTemplateList: ResumeStyleTemplate[] = [
  ...themeStyleTemplates,
  ...titleStyleTemplates,
];
