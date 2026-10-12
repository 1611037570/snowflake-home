import academic from "@/domain/resume/theme/styles/academic";
import { cloneDeep } from "lodash-es";
import type { ResumeUi } from "@/domain/resume/theme/uiTypes";
import angledLine from "@/domain/resume/theme/styles/angledLine";
import badgeLine from "@/domain/resume/theme/styles/badgeLine";
import business from "@/domain/resume/theme/styles/business";
import businessSimple from "@/domain/resume/theme/styles/businessSimple";
import blueDoubleBar from "@/domain/resume/theme/styles/blueDoubleBar";
import burgundySidebar from "@/domain/resume/theme/styles/burgundySidebar";
import chevronRibbon from "@/domain/resume/theme/styles/chevronRibbon";
import colorBar from "@/domain/resume/theme/styles/colorBar";
import curvedHeader from "@/domain/resume/theme/styles/curvedHeader";
import defaultTheme from "@/domain/resume/theme/styles/default";
import doubleArrow from "@/domain/resume/theme/styles/doubleArrow";
import frame from "@/domain/resume/theme/styles/frame";
import inkSidebar from "@/domain/resume/theme/styles/inkSidebar";
import labelLine from "@/domain/resume/theme/styles/labelLine";
import layeredCurve from "@/domain/resume/theme/styles/layeredCurve";
import lightSail from "@/domain/resume/theme/styles/lightSail";
import markerGrid from "@/domain/resume/theme/styles/markerGrid";
import minimal from "@/domain/resume/theme/styles/minimal";
import modern from "@/domain/resume/theme/styles/modern";
import navyGuide from "@/domain/resume/theme/styles/navyGuide";
import numberedSections from "@/domain/resume/theme/styles/numberedSections";
import outline from "@/domain/resume/theme/styles/outline";
import plainColorBar from "@/domain/resume/theme/styles/plainColorBar";
import pineArchive from "@/domain/resume/theme/styles/pineArchive";
import { plainTitleThemes } from "@/domain/resume/theme/styles/plainTitleThemes";
import sandSidebar from "@/domain/resume/theme/styles/sandSidebar";
import redWhiteSidebar from "@/domain/resume/theme/styles/redWhiteSidebar";
import ringTimeline from "@/domain/resume/theme/styles/ringTimeline";
import sailMasthead from "@/domain/resume/theme/styles/sailMasthead";
import slantedLayer from "@/domain/resume/theme/styles/slantedLayer";
import sloganBand from "@/domain/resume/theme/styles/sloganBand";
import songElegance from "@/domain/resume/theme/styles/songElegance";
import tealRail from "@/domain/resume/theme/styles/tealRail";
import tealRibbon from "@/domain/resume/theme/styles/tealRibbon";
import tealRibbonCircles from "@/domain/resume/theme/styles/tealRibbonCircles";
import tealCard from "@/domain/resume/theme/styles/tealCard";
import terraCards from "@/domain/resume/theme/styles/terraCards";
import stripedRibbon from "@/domain/resume/theme/styles/stripedRibbon";
import squareTimeline from "@/domain/resume/theme/styles/squareTimeline";
import topUserTwoColumn from "@/domain/resume/theme/styles/topUserTwoColumn";
import twoColumn from "@/domain/resume/theme/styles/twoColumn";
import userBand from "@/domain/resume/theme/styles/userBand";
import violetBiography from "@/domain/resume/theme/styles/violetBiography";
import {
  createThemeTemplates,
  resolveThemeTemplate,
  type ResumeThemeDefinition,
  type ThemePageAppearance,
} from "@/domain/resume/theme/styles/createThemeTemplate";

// 主题定义集中成数组，并由此生成唯一注册表。
export const themeTemplateList = createThemeTemplates([
  defaultTheme,
  modern,
  navyGuide,
  violetBiography,
  business,
  businessSimple,
  blueDoubleBar,
  burgundySidebar,
  sandSidebar,
  redWhiteSidebar,
  inkSidebar,
  pineArchive,
  minimal,
  academic,
  tealRail,
  tealRibbon,
  tealRibbonCircles,
  tealCard,
  terraCards,
  outline,
  topUserTwoColumn,
  twoColumn,
  colorBar,
  plainColorBar,
  frame,
  squareTimeline,
  ringTimeline,
  sailMasthead,
  labelLine,
  numberedSections,
  badgeLine,
  angledLine,
  layeredCurve,
  lightSail,
  markerGrid,
  doubleArrow,
  chevronRibbon,
  slantedLayer,
  stripedRibbon,
  sloganBand,
  songElegance,
  userBand,
  curvedHeader,
  ...plainTitleThemes,
]);

/** 由主题声明推导编号，避免另行维护主题编号名单。 */
export type ResumeThemeId = (typeof themeTemplateList)[number]["id"];

// 主题选择列表与预览渲染共用这份注册表，默认主题必须存在。
export const resumeThemeRegistry = Object.fromEntries(
  themeTemplateList.map((theme) => [theme.id, theme]),
) as Record<string, ResumeThemeDefinition> & Record<ResumeThemeId, ResumeThemeDefinition>;

// 静态主题只展开一次，运行时读取预设不创建内容与模块配置空壳。
const presetCache = new Map<string, ResumeUi>();
export const getResumeThemeUiPreset = (id?: string): ResumeUi => {
  const definition = resumeThemeRegistry[id || "default"] || resumeThemeRegistry.default;
  let preset = presetCache.get(definition.id);
  if (!preset) {
    preset = resolveThemeTemplate(definition).item.ui;
    presetCache.set(definition.id, preset);
  }
  return preset;
};

export const getResumeThemeTemplate = (id?: string) => {
  const definition = resumeThemeRegistry[id || "default"] || resumeThemeRegistry.default;
  return {
    name: definition.name, // 主题显示名称
    id: definition.id, // 主题编号
    description: definition.description, // 主题说明
    item: { // 应用主题时的简历初始配置
      data: {}, // 简历内容占位
      config: {}, // 模块配置占位
      ui: cloneDeep(getResumeThemeUiPreset(definition.id)), // 独立可编辑的用户预设
    },
  };
};

/** 按主题编号读取页面级外观声明：公共页面据此渲染，不判断主题名称 */
export const resolveThemePageAppearance = (id?: string): ThemePageAppearance =>
  (resumeThemeRegistry[id || "default"] || resumeThemeRegistry.default)?.pageAppearance || {};
