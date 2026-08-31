import { darkThemeColors } from "@/configs";
// ===========列表=====================
// 主题色列表
export const themeColors = [...darkThemeColors];

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
    value: "",
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
];
// 用户信息展示模式列表
export const userInfoModeList = [
  {
    name: "图标",
    value: "icon",
  },
  {
    name: "文字",
    value: "text",
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
// ===========默认值=====================
export const defaultThemeColor = themeColors[0].value;
// 默认页边距
export const defaultPadding = 24;
// 默认字体类型
export const defaultFontFamily = "text-puhui";
// 默认字体大小
export const defaultFontSize = 16;
export const defaultLineHeight = 1.2;
// 默认模块间距
export const defaultModuleSpacing = 12;
// 默认主题样式
export const defaultThemeTemplate = "default";
// 默认用户信息展示模式
export const defaultUserInfoMode = "text";
// 默认头像位置
export const defaultAvatarPosition = "left";
// ===========参数范围（编辑器滑杆与一页纸压缩共用，只维护这一处）=====================
export const uiParamRanges = {
  // 页边距
  padding: { min: 12, max: 96, step: 1 },
  // 字体大小
  fontSize: { min: 10, max: 24, step: 2 },
  // 行高
  lineHeight: { min: 1, max: 2, step: 0.1 },
  // 模块间距
  moduleSpacing: { min: 2, max: 48, step: 1 },
};
export const DEFAULT_UI = {
  // 页边距
  padding: defaultPadding,
  // 字体大小
  fontSize: defaultFontSize,
  // 行高
  lineHeight: defaultLineHeight,
  // 模块间距
  moduleSpacing: defaultModuleSpacing,
  // 主题颜色
  themeColor: defaultThemeColor,
  // 主题样式
  themeTemplate: defaultThemeTemplate,
  // 字体类型
  fontFamily: defaultFontFamily,
  // 用户信息展示模式
  userInfoMode: defaultUserInfoMode,
  // 头像位置
  avatarPosition: defaultAvatarPosition,
};
