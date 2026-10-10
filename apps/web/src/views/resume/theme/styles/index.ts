import academic from "./academic";
import { cloneDeep } from "lodash-es";
import type { ResumeUi } from "../uiTypes";
import angledLine from "./angledLine";
import business from "./business";
import burgundySidebar from "./burgundySidebar";
import chevronRibbon from "./chevronRibbon";
import colorBar from "./colorBar";
import curvedHeader from "./curvedHeader";
import defaultTheme from "./default";
import doubleArrow from "./doubleArrow";
import frame from "./frame";
import labelLine from "./labelLine";
import layeredCurve from "./layeredCurve";
import markerGrid from "./markerGrid";
import minimal from "./minimal";
import modern from "./modern";
import navyGuide from "./navyGuide";
import outline from "./outline";
import sandSidebar from "./sandSidebar";
import redWhiteSidebar from "./redWhiteSidebar";
import ringTimeline from "./ringTimeline";
import slantedLayer from "./slantedLayer";
import sloganBand from "./sloganBand";
import songElegance from "./songElegance";
import tealRail from "./tealRail";
import tealCard from "./tealCard";
import stripedRibbon from "./stripedRibbon";
import squareTimeline from "./squareTimeline";
import topUserTwoColumn from "./topUserTwoColumn";
import twoColumn from "./twoColumn";
import userBand from "./userBand";
import vivid from "./vivid";
import violetBiography from "./violetBiography";
import {
  createThemeTemplates,
  resolveThemeTemplate,
  type ResumeThemeDefinition,
  type ThemePageAppearance,
} from "./createThemeTemplate";

// 主题定义集中成数组，并由此生成唯一注册表。
export const themeTemplateList = createThemeTemplates([
  defaultTheme,
  modern,
  navyGuide,
  violetBiography,
  business,
  burgundySidebar,
  sandSidebar,
  redWhiteSidebar,
  minimal,
  academic,
  vivid,
  tealRail,
  tealCard,
  outline,
  topUserTwoColumn,
  twoColumn,
  colorBar,
  frame,
  squareTimeline,
  ringTimeline,
  labelLine,
  angledLine,
  layeredCurve,
  markerGrid,
  doubleArrow,
  chevronRibbon,
  slantedLayer,
  stripedRibbon,
  sloganBand,
  songElegance,
  userBand,
  curvedHeader,
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
