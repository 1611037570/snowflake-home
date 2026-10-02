import academic from "./academic";
import angledLine from "./angledLine";
import business from "./business";
import burgundySidebar from "./burgundySidebar";
import chevronRibbon from "./chevronRibbon";
import classic from "./classic";
import colorBar from "./colorBar";
import creative from "./creative";
import curvedHeader from "./curvedHeader";
import defaultTheme from "./default";
import doubleArrow from "./doubleArrow";
import foldedLabel from "./foldedLabel";
import fresh from "./fresh";
import frame from "./frame";
import labelLine from "./labelLine";
import layeredCurve from "./layeredCurve";
import markerGrid from "./markerGrid";
import minimal from "./minimal";
import inkMagazine from "./inkMagazine";
import modern from "./modern";
import navyGuide from "./navyGuide";
import outline from "./outline";
import sandSidebar from "./sandSidebar";
import redWhiteSidebar from "./redWhiteSidebar";
import slantedLayer from "./slantedLayer";
import sloganBand from "./sloganBand";
import steady from "./steady";
import tealRail from "./tealRail";
import stripedRibbon from "./stripedRibbon";
import timeline from "./timeline";
import squareTimeline from "./squareTimeline";
import topUserTwoColumn from "./topUserTwoColumn";
import twoColumn from "./twoColumn";
import userBand from "./userBand";
import vivid from "./vivid";
import {
  createThemeTemplates,
  resolveThemeTemplate,
  type ResumeThemeDefinition,
} from "./createThemeTemplate";

// 主题定义集中成数组，并由此生成唯一注册表。
export const themeTemplateList = createThemeTemplates([
  defaultTheme,
  modern,
  navyGuide,
  business,
  burgundySidebar,
  sandSidebar,
  redWhiteSidebar,
  minimal,
  inkMagazine,
  classic,
  academic,
  fresh,
  vivid,
  creative,
  steady,
  tealRail,
  outline,
  topUserTwoColumn,
  twoColumn,
  colorBar,
  frame,
  timeline,
  squareTimeline,
  labelLine,
  angledLine,
  layeredCurve,
  markerGrid,
  doubleArrow,
  chevronRibbon,
  slantedLayer,
  foldedLabel,
  stripedRibbon,
  sloganBand,
  userBand,
  curvedHeader,
]);

// 主题选择列表与预览渲染共用这份注册表。
export const resumeThemeRegistry = Object.fromEntries(
  themeTemplateList.map((theme) => [theme.id, theme]),
) as Record<string, ResumeThemeDefinition>;

export const getResumeThemeTemplate = (id?: string) =>
  resolveThemeTemplate(resumeThemeRegistry[id || "default"] || resumeThemeRegistry.default);
