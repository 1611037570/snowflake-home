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
];
// ===========默认值=====================
export const defaultThemeColor = themeColors[0].value;
// 默认页边距
export const defaultPadding = 12;
// 默认字体类型
export const defaultFontFamily = "text-puhui";
// 默认字体大小
export const defaultFontSize = 16;
export const defaultLineHeight = 1.2;
// 默认模块间距
export const defaultModuleSpacing = 12;
// 默认主题样式
export const defaultThemeTemplate = "default";
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
};
