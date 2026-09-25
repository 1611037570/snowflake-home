import { darkThemeColors } from "@/configs";
// ===========列表=====================
// 主题色列表
export const themeColors = [
  { name: "主题色", value: "#50A2FF" },
  ...darkThemeColors.slice(0, -2),
  darkThemeColors.at(-1),
  { name: "极致黑", value: "#000000" },
];

// 字体类型列表
export const fontFamilyList = [
  {
    name: "阿里普惠体",
    value: "text-puhui",
  },
  {
    name: "汉仪易烊千玺体",
    value: "text-yyqx",
  },
  {
    name: "跟随系统",
    value: "null",
  },
];

// 样式模板统一提供完整 UI，避免依赖示例简历自身的 UI 配置。
const createThemeTemplate = (
  name: string,
  id: string,
  description: string,
  ui: Record<string, unknown>,
) => ({
  name,
  id,
  description,
  item: {
    data: {},
    config: {},
    ui: {
      language: "zh",
      footer: "",
      paddingVertical: 24,
      paddingHorizontal: 24,
      fontSize: 16,
      titleFontSize: 22,
      lineHeight: 1.2,
      paragraphSpacing: 12,
      moduleSpacing: 12,
      themeColor: "#50A2FF",
      themeTemplate: id,
      fontFamily: "text-puhui",
      userInfoMode: "text",
      userInfoLayout: "flex",
      avatarPosition: "right",
      infoPosition: "left",
      dateStyle: "dot",
      datePosition: "right",
      textAlign: "auto",
      titleIconMode: "none",
      linkUnderline: false,
      infoSeparator: "space",
      moduleContent: {},
      ...ui,
    },
  },
});

// 主题样式列表
export const themeTemplateList = [
  createThemeTemplate("默认", "default", "清晰通用的基础简历样式。", {}),
  createThemeTemplate("现代", "modern", "适合互联网与技术岗位的现代简历样式。", {
    themeColor: "#2563EB",
    avatarPosition: "center",
    infoPosition: "center",
    titleIconMode: "icon",
  }),
  createThemeTemplate("商务", "business", "适合职场与商务场景的正式简历样式。", {
    themeColor: "#1E3A5F",
    fontSize: 15,
    titleFontSize: 21,
    moduleSpacing: 18,
    dateStyle: "cn",
  }),
  createThemeTemplate("简约", "minimal", "减少视觉干扰，突出内容本身的简历样式。", {
    themeColor: "#111827",
    paddingVertical: 30,
    paddingHorizontal: 30,
    paragraphSpacing: 6,
    moduleSpacing: 9,
  }),
  createThemeTemplate("经典", "classic", "适合传统行业与正式投递的经典简历样式。", {
    themeColor: "#7C3AED",
    fontFamily: "text-yyqx",
    titleIconMode: "icon",
    dateStyle: "cn",
  }),
  createThemeTemplate("学术", "academic", "强调研究经历与文字内容的学术简历样式。", {
    themeColor: "#0F766E",
    fontSize: 15,
    lineHeight: 1.4,
    textAlign: "justify",
    dateStyle: "cn",
  }),
  createThemeTemplate("清新", "fresh", "适合教育、设计与初入职场场景的简历样式。", {
    themeColor: "#16A34A",
    avatarPosition: "center",
    infoPosition: "center",
    titleIconMode: "icon",
  }),
  createThemeTemplate("活力", "vivid", "适合运营、市场与创意岗位的活力简历样式。", {
    themeColor: "#EA580C",
    fontSize: 17,
    titleFontSize: 24,
    userInfoMode: "icon",
    titleIconMode: "icon",
    moduleContent: { variant: "card" },
  }),
  createThemeTemplate("创意", "creative", "突出个人表达与作品展示的创意简历样式。", {
    themeColor: "#DB2777",
    avatarPosition: "center",
    infoPosition: "center",
    userInfoMode: "icon",
    titleIconMode: "icon",
  }),
  createThemeTemplate("稳重", "steady", "适合经验型岗位与正式求职的稳重简历样式。", {
    themeColor: "#475569",
    fontSize: 15,
    lineHeight: 1.3,
    moduleSpacing: 18,
    dateStyle: "cn",
  }),
  createThemeTemplate(
    "通栏双栏",
    "topUserTwoColumn",
    "个人信息顶部通栏，其余模块固定分到左右两栏。",
    {
      themeColor: "#0F766E",
      pageLayoutTemplate: "topUserTwoColumn",
    },
  ),
  createThemeTemplate("双栏", "twoColumn", "所有模块固定分到左右两栏，适合内容较多的简历。", {
    themeColor: "#7C3AED",
    pageLayoutTemplate: "twoColumn",
  }),
];
// 个人信息展示模式列表
export const userInfoModeList = [
  {
    name: "仅图标",
    value: "icon",
  },
  {
    name: "文字",
    value: "text",
  },
  {
    name: "不显示",
    value: "none",
  },
];
// 个人信息布局列表
export const userInfoLayoutList = [
  {
    name: "弹性",
    value: "flex",
  },
  {
    name: "网格",
    value: "grid",
  },
];
// 头像位置列表
export const avatarPositionList = [
  {
    name: "左",
    value: "left",
  },
  {
    name: "居中",
    value: "center",
  },
  {
    name: "右",
    value: "right",
  },
];
// 信息位置列表（信息内容的水平对齐）
export const infoPositionList = [
  {
    name: "左",
    value: "left",
  },
  {
    name: "居中",
    value: "center",
  },
  {
    name: "右",
    value: "right",
  },
];
// 日期位置列表（经历日期在条目内的水平位置）
export const datePositionList = [
  {
    name: "左",
    value: "left",
  },
  {
    name: "右",
    value: "right",
  },
];
// 文本对齐列表（正文富文本的水平对齐方式）
export const textAlignList = [
  {
    name: "系统对齐",
    value: "auto",
  },
  {
    name: "两端对齐",
    value: "justify",
  },
];
// 日期样式列表（经历日期展示格式）
export const dateStyleList = [
  {
    name: "2026.9",
    value: "dot",
  },
  {
    name: "2026年9月",
    value: "cn",
  },
];
// 并列信息的分隔方式，留白保持当前简历的默认视觉。
export const infoSeparatorList = [
  { name: "留白", value: "space", mark: "" },
  { name: "圆点", value: "dot", mark: "·" },
  { name: "竖线", value: "line", mark: "|" },
  { name: "斜线", value: "slash", mark: "/" },
  { name: "逗号", value: "comma", mark: "，" },
];
// 未配置或未知值均回退为留白，供预览中的组合字段统一拼接。
export const getInfoSeparatorMark = (value: string) =>
  infoSeparatorList.find((option) => option.value === value)?.mark || "";
// 模块标题图标模式列表
export const titleIconModeList = [
  {
    name: "无图标",
    value: "none",
  },
  {
    name: "图标",
    value: "icon",
  },
  {
    name: "方形背景",
    value: "square",
  },
  {
    name: "圆形背景",
    value: "circle",
  },
];
// ===========默认值=====================
export const defaultThemeColor = "#50A2FF";
// 默认自定义页尾品牌名（留空表示使用默认品牌名）
export const defaultFooter = "";
// 默认上下页边距
export const defaultPaddingVertical = 24;
// 默认左右页边距
export const defaultPaddingHorizontal = 24;
// 默认字体类型
export const defaultFontFamily = "text-puhui";
// 默认字体大小
export const defaultFontSize = 16;
// 默认模块标题字号
export const defaultTitleFontSize = 22;
export const defaultLineHeight = 1.2;
// 默认段落间距，延续现有 mt-3 的视觉间距
export const defaultParagraphSpacing = 12;
// 默认模块间距
export const defaultModuleSpacing = 12;
// 默认左栏宽度占比（双栏布局），左栏保持为较窄的一栏
export const defaultLeftColumnWidth = 40;
// 默认主题样式
export const defaultThemeTemplate = "default";
// 默认个人信息展示模式
export const defaultUserInfoMode = "text";
// 默认个人信息布局
export const defaultUserInfoLayout = "flex";
// 默认头像位置
export const defaultAvatarPosition = "right";
// 默认信息位置
export const defaultInfoPosition = "left";
// 默认日期样式
export const defaultDateStyle = "dot";
// 默认日期位置
export const defaultDatePosition = "right";
// 默认文本对齐
export const defaultTextAlign = "auto";
// 默认模块标题图标模式
export const defaultTitleIconMode = "none";
// 默认链接下划线开关
export const defaultLinkUnderline = false;
// 默认并列信息使用留白分隔，保持既有模板视觉。
export const defaultInfoSeparator = "space";
// ===========参数范围（编辑器滑杆与一页纸压缩共用，只维护这一处）=====================
export const uiParamRanges = {
  // 上下页边距
  paddingVertical: { min: 12, max: 96, step: 1 },
  // 左右页边距
  paddingHorizontal: { min: 12, max: 96, step: 1 },
  // 左栏宽度占比（双栏布局）
  leftColumnWidth: { min: 20, max: 40, step: 1 },
  // 字体大小
  fontSize: { min: 12, max: 48, step: 2 },
  // 模块标题字号
  titleFontSize: { min: 12, max: 48, step: 2 },
  // 行高
  lineHeight: { min: 1, max: 2, step: 0.1 },
  // 段落间距
  paragraphSpacing: { min: 0, max: 36, step: 3 },
  // 模块间距
  moduleSpacing: { min: 2, max: 48, step: 1 },
};
export const DEFAULT_UI = {
  // 简历展示语言（预览区模块标题语言包使用）
  language: "zh",
  // 自定义页尾品牌名：留空使用默认品牌，页码部分固定展示
  footer: "",
  // 上下页边距
  paddingVertical: defaultPaddingVertical,
  // 左右页边距
  paddingHorizontal: defaultPaddingHorizontal,
  // 字体大小
  fontSize: defaultFontSize,
  // 模块标题字号
  titleFontSize: defaultTitleFontSize,
  // 行高
  lineHeight: defaultLineHeight,
  // 段落间距
  paragraphSpacing: defaultParagraphSpacing,
  // 模块间距
  moduleSpacing: defaultModuleSpacing,
  // 主题颜色
  themeColor: defaultThemeColor,
  // 主题样式
  themeTemplate: defaultThemeTemplate,
  // 字体类型
  fontFamily: defaultFontFamily,
  // 个人信息展示模式
  userInfoMode: defaultUserInfoMode,
  // 个人信息布局
  userInfoLayout: defaultUserInfoLayout,
  // 头像位置
  avatarPosition: defaultAvatarPosition,
  // 信息位置
  infoPosition: defaultInfoPosition,
  // 日期样式
  dateStyle: defaultDateStyle,
  // 日期位置
  datePosition: defaultDatePosition,
  // 文本对齐
  textAlign: defaultTextAlign,
  // 模块标题图标模式
  titleIconMode: defaultTitleIconMode,
  // 链接下划线：开启后在预览中显示链接下划线
  linkUnderline: defaultLinkUnderline,
  // 并列信息分隔符：岗位、部门、专业等字段统一使用
  infoSeparator: defaultInfoSeparator,
};
