import academic from "@/domain/resume/theme/styles/academic";
import { cloneDeep } from "lodash-es";
// 简约档新增主题：集中放在列表最前，方便在模板库首屏认样
import numberWatermark from "@/domain/resume/theme/styles/numberWatermark";
import ruleHead from "@/domain/resume/theme/styles/ruleHead";
import pointBody from "@/domain/resume/theme/styles/pointBody";
import type { ResumeUi } from "@/domain/resume/theme/uiTypes";
import angledLine from "@/domain/resume/theme/styles/angledLine";
import badgeLine from "@/domain/resume/theme/styles/badgeLine";
import business from "@/domain/resume/theme/styles/business";
import businessSimple from "@/domain/resume/theme/styles/businessSimple";
import blueDoubleBar from "@/domain/resume/theme/styles/blueDoubleBar";
import blueBilingual from "@/domain/resume/theme/styles/blueBilingual";
import blueAngleHeader from "@/domain/resume/theme/styles/blueAngleHeader";
import blueGoldRibbon from "@/domain/resume/theme/styles/blueGoldRibbon";
import blueSquareLine from "@/domain/resume/theme/styles/blueSquareLine";
import blueProfileBand from "@/domain/resume/theme/styles/blueProfileBand";
import blueStripeResume from "@/domain/resume/theme/styles/blueStripeResume";
import burgundySidebar from "@/domain/resume/theme/styles/burgundySidebar";
import chevronRibbon from "@/domain/resume/theme/styles/chevronRibbon";
import chronicleRail from "@/domain/resume/theme/styles/chronicleRail";
import colorBar from "@/domain/resume/theme/styles/colorBar";
import colorDotNotes from "@/domain/resume/theme/styles/colorDotNotes";
import compactTimeline from "@/domain/resume/theme/styles/compactTimeline";
import centeredInsetFrame from "@/domain/resume/theme/styles/centeredInsetFrame";
import curvedHeader from "@/domain/resume/theme/styles/curvedHeader";
import defaultTheme from "@/domain/resume/theme/styles/default";
import doubleArrow from "@/domain/resume/theme/styles/doubleArrow";
import doubleRail from "@/domain/resume/theme/styles/doubleRail";
import dotInk from "@/domain/resume/theme/styles/dotInk";
import fileIndex from "@/domain/resume/theme/styles/fileIndex";
import forestChalk from "@/domain/resume/theme/styles/forestChalk";
import frame from "@/domain/resume/theme/styles/frame";
import frameProfile from "@/domain/resume/theme/styles/frameProfile";
import hairlineRail from "@/domain/resume/theme/styles/hairlineRail";
import inkSidebar from "@/domain/resume/theme/styles/inkSidebar";
import inkWhiteSpace from "@/domain/resume/theme/styles/inkWhiteSpace";
import indigoOrbit from "@/domain/resume/theme/styles/indigoOrbit";
import jadeRightSidebar from "@/domain/resume/theme/styles/jadeRightSidebar";
import labelLine from "@/domain/resume/theme/styles/labelLine";
import layeredCurve from "@/domain/resume/theme/styles/layeredCurve";
import lavenderCards from "@/domain/resume/theme/styles/lavenderCards";
import lightSail from "@/domain/resume/theme/styles/lightSail";
import lightPoster from "@/domain/resume/theme/styles/lightPoster";
import markerGrid from "@/domain/resume/theme/styles/markerGrid";
import minimal from "@/domain/resume/theme/styles/minimal";
import mintCards from "@/domain/resume/theme/styles/mintCards";
import modern from "@/domain/resume/theme/styles/modern";
import monoEditorial from "@/domain/resume/theme/styles/monoEditorial";
import neonCircuit from "@/domain/resume/theme/styles/neonCircuit";
import navyGuide from "@/domain/resume/theme/styles/navyGuide";
import noteGrid from "@/domain/resume/theme/styles/noteGrid";
import numberedSections from "@/domain/resume/theme/styles/numberedSections";
import outline from "@/domain/resume/theme/styles/outline";
import pastelSketch from "@/domain/resume/theme/styles/pastelSketch";
import pineArchive from "@/domain/resume/theme/styles/pineArchive";
import popCollage from "@/domain/resume/theme/styles/popCollage";
import { plainTitleThemes } from "@/domain/resume/theme/styles/plainTitleThemes";
import sandSidebar from "@/domain/resume/theme/styles/sandSidebar";
import redWhiteSidebar from "@/domain/resume/theme/styles/redWhiteSidebar";
import redBlackEngineer from "@/domain/resume/theme/styles/redBlackEngineer";
import ringTimeline from "@/domain/resume/theme/styles/ringTimeline";
import ruledPaper from "@/domain/resume/theme/styles/ruledPaper";
import sailMasthead from "@/domain/resume/theme/styles/sailMasthead";
import slantedLayer from "@/domain/resume/theme/styles/slantedLayer";
import slateRightSidebar from "@/domain/resume/theme/styles/slateRightSidebar";
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
import vinePaper from "@/domain/resume/theme/styles/vinePaper";
import warmSandRight from "@/domain/resume/theme/styles/warmSandRight";
import {
  createThemeTemplates,
  resolveThemeTemplate,
  type ResumeThemeDefinition,
  type ThemePageAppearance,
} from "@/domain/resume/theme/styles/createThemeTemplate";

// 主题定义集中成数组，并由此生成唯一注册表。
export const themeTemplateList = createThemeTemplates([
  // 数组顺序即模板库卡片顺序：新增主题优先展示，岁序与墨玉右栏是最新两套，简约档紧随其后。
  chronicleRail,
  jadeRightSidebar,
  numberWatermark,
  ruleHead,
  pointBody,
  warmSandRight,
  monoEditorial,
  lightPoster,
  compactTimeline,
  defaultTheme,
  modern,
  neonCircuit,
  navyGuide,
  violetBiography,
  vinePaper,
  business,
  businessSimple,
  blueDoubleBar,
  blueBilingual,
  blueAngleHeader,
  blueGoldRibbon,
  blueSquareLine,
  blueProfileBand,
  blueStripeResume,
  burgundySidebar,
  sandSidebar,
  redWhiteSidebar,
  redBlackEngineer,
  inkSidebar,
  inkWhiteSpace,
  indigoOrbit,
  pineArchive,
  popCollage,
  colorDotNotes,
  centeredInsetFrame,
  minimal,
  academic,
  tealRail,
  tealRibbon,
  tealRibbonCircles,
  tealCard,
  terraCards,
  lavenderCards,
  mintCards,
  forestChalk,
  pastelSketch,
  outline,
  topUserTwoColumn,
  twoColumn,
  colorBar,
  frame,
  fileIndex,
  squareTimeline,
  ringTimeline,
  hairlineRail,
  dotInk,
  doubleRail,
  sailMasthead,
  labelLine,
  numberedSections,
  badgeLine,
  angledLine,
  layeredCurve,
  lightSail,
  markerGrid,
  noteGrid,
  ruledPaper,
  doubleArrow,
  chevronRibbon,
  slantedLayer,
  slateRightSidebar,
  stripedRibbon,
  sloganBand,
  songElegance,
  userBand,
  curvedHeader,
  frameProfile,
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
