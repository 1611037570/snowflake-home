import { darkThemeColors } from "@/configs";
// ===========列表=====================
// 主题色列表
export const themeColors = [...darkThemeColors];
// 页边距列表
export const paddingList = [
  {
    name: "特紧凑",
    value: 10,
  },
  {
    name: "紧凑",
    value: 20,
  },
  {
    name: "适中",
    value: 28,
  },
  {
    name: "宽松",
    value: 36,
  },
  {
    name: "特宽松",
    value: 46,
  },
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
    value: "",
  },
];
// 字体大小列表
export const fontSizeList = [
  {
    name: "特小",
    value: 8,
  },
  {
    name: "小",
    value: 12,
  },
  {
    name: "中",
    value: 15,
  },
  {
    name: "大",
    value: 18,
  },
  {
    name: "特大",
    value: 22,
  },
];
// 行间距列表
export const lineHeightList = [
  {
    name: "特紧凑",
    value: 18,
  },
  {
    name: "紧凑",
    value: 22,
  },
  {
    name: "适中",
    value: 25,
  },
  {
    name: "宽松",
    value: 28,
  },
  {
    name: "特宽松",
    value: 32,
  },
];

// 主题样式列表
export const themeStyleList = [
  {
    name: "默认",
    value: "default",
  },
];
// ===========默认值=====================
export const defaultThemeColor = themeColors[0].value;
// 默认页边距
export const defaultPadding = paddingList[2].value;
// 默认字体类型
export const defaultFontFamily = fontFamilyList[0].value;
// 默认字体大小
export const defaultFontSize = fontSizeList[2].value;
// 默认行间距
export const defaultLineHeight = lineHeightList[2].value;
// 默认主题样式
export const defaultThemeStyle = themeStyleList[0].value;
