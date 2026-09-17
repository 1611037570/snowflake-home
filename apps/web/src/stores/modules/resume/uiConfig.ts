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

// 主题样式列表
export const themeTemplateList = [
  {
    name: "默认",
    value: "default",
  },
  {
    name: "现代",
    value: "modern",
  },
  {
    name: "商务",
    value: "business",
  },
  {
    name: "简约",
    value: "minimal",
  },
  {
    name: "经典",
    value: "classic",
  },
  {
    name: "学术",
    value: "academic",
  },
  {
    name: "清新",
    value: "fresh",
  },
  {
    name: "活力",
    value: "vivid",
  },
  {
    name: "创意",
    value: "creative",
  },
  {
    name: "稳重",
    value: "steady",
  },
];
// 个人信息展示模式列表
export const userInfoModeList = [
  {
    name: "图标",
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
// ===========默认值=====================
export const defaultThemeColor = themeColors[0].value;
// 默认自定义页尾品牌名（留空表示使用默认品牌名）
export const defaultFooter = "";
// 默认页边距
export const defaultPadding = 24;
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
// ===========参数范围（编辑器滑杆与一页纸压缩共用，只维护这一处）=====================
export const uiParamRanges = {
  // 页边距
  padding: { min: 12, max: 96, step: 1 },
  // 字体大小
  fontSize: { min: 10, max: 24, step: 2 },
  // 模块标题字号
  titleFontSize: { min: 12, max: 40, step: 2 },
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
  // 页边距
  padding: defaultPadding,
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
};
