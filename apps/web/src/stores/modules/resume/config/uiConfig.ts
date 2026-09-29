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
    name: "思源宋体",
    value: "text-source-han-serif",
  },
  {
    name: "思源黑体",
    value: "text-source-han-sans",
  },
  {
    name: "霞鹜新晰黑",
    value: "text-lxgw-neo-xihei",
  },
  {
    name: "霞鹜文楷 Lite",
    value: "text-lxgw-wenkai-lite",
  },
  {
    name: "Inter",
    value: "text-inter",
  },
  {
    name: "EB Garamond",
    value: "text-eb-garamond",
  },
];

// 默认简历页面背景色
export const defaultPageBackground = "#ffffff";
// 简历页面背景色选项：默认白、极致黑与象牙米白
export const pageBackgroundColors = [
  { name: "backgroundWhite", value: defaultPageBackground },
  { name: "backgroundBlack", value: "#000000" },
  { name: "backgroundIvory", value: "#F5F0E6" },
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
  "page.padding.vertical": { min: 12, max: 96, step: 1 },
  // 左右页边距
  "page.padding.horizontal": { min: 12, max: 96, step: 1 },
  // 左栏宽度占比（双栏布局）
  "layout.leftColumnWidth": { min: 20, max: 40, step: 1 },
  // 字体大小
  "font.size": { min: 12, max: 48, step: 2 },
  // 模块标题字号
  "font.titleSize": { min: 12, max: 48, step: 2 },
  // 行高
  "font.lineHeight": { min: 1, max: 2, step: 0.1 },
  // 段落间距
  "page.spacing.paragraph": { min: 0, max: 36, step: 3 },
  // 模块间距
  "page.spacing.module": { min: 2, max: 48, step: 1 },
};
export const DEFAULT_UI = {
  page: {
    background: defaultPageBackground,
    padding: { vertical: defaultPaddingVertical, horizontal: defaultPaddingHorizontal },
    // 页面内留白参数统一由页面配置管理。
    spacing: {
      paragraph: defaultParagraphSpacing,
      module: defaultModuleSpacing,
    },
    footer: defaultFooter,
  },
  font: {
    family: defaultFontFamily,
    size: defaultFontSize,
    titleSize: defaultTitleFontSize,
    lineHeight: defaultLineHeight,
  },
  content: {
    language: "zh",
    textAlign: defaultTextAlign,
    infoSeparator: defaultInfoSeparator,
    linkUnderline: defaultLinkUnderline,
    dateStyle: defaultDateStyle,
    datePosition: defaultDatePosition,
  },
  theme: {
    color: defaultThemeColor,
    template: defaultThemeTemplate,
    titleIconMode: defaultTitleIconMode,
    userModule: "auto",
    module: "auto",
    item: "auto",
  },
  layout: {
    type: "single",
    columns: null,
    leftColumnWidth: defaultLeftColumnWidth,
  },
  user: {
    infoMode: defaultUserInfoMode,
    infoLayout: defaultUserInfoLayout,
    avatarPosition: defaultAvatarPosition,
    infoPosition: defaultInfoPosition,
  },
};
