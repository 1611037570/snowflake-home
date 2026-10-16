import { darkThemeColors } from "@/configs";
// ===========列表=====================
// 主题色列表
export const themeColors = [
  { name: "主题色", value: "#50A2FF" },
  ...darkThemeColors.slice(0, -2),
  darkThemeColors.at(-1),
  { name: "极致黑", value: "#000000" },
];

// 正文字体颜色预设：从黑色逐级过渡到浅灰，供设计面板快速选择。
export const fontColorOptions = [
  { name: "fontColorBlack", value: "#000000" }, // 黑色
  { name: "fontColorDeepGray", value: "#171717" }, // 深灰
  { name: "fontColorDarkGray", value: "#2e2e2e" }, // 暗灰
  { name: "fontColorGray", value: "#454545" }, // 中灰
  { name: "fontColorLightGray", value: "#5c5c5c" }, // 浅灰
  { name: "fontColorLighterGray", value: "#727272" }, // 更浅灰
];

// 黑底字体颜色预设：与白底阶梯按明度镜像（255 - 白底值），从白色逐级过渡到浅灰。
export const fontColorOptionsOnDark = [
  { name: "fontColorWhite", value: "#ffffff" }, // 白色
  { name: "fontColorLighterGray", value: "#e8e8e8" }, // 更浅灰
  { name: "fontColorLightGray", value: "#d1d1d1" }, // 浅灰
  { name: "fontColorGray", value: "#bababa" }, // 中灰
  { name: "fontColorDarkGray", value: "#a3a3a3" }, // 暗灰
  { name: "fontColorDeepGray", value: "#8d8d8d" }, // 深灰
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
// 黑底纸张背景值：简历背景选到极致黑时，字体颜色预设切换为对应浅色阶梯
export const darkPageBackground = "#000000";
// 简历页面背景色选项：默认白、极致黑与象牙米白
export const pageBackgroundColors = [
  { name: "backgroundWhite", value: defaultPageBackground },
  { name: "backgroundBlack", value: darkPageBackground },
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
// 日期样式列表（经历日期展示格式）：示例年份统一用 2026，选项名只体现分隔符与年月顺序
export const dateStyleList = [
  {
    name: "2026-9",
    value: "dash",
  },
  {
    name: "2026.9",
    value: "dot",
  },
  {
    name: "2026/9",
    value: "slash",
  },
  {
    name: "9/2026",
    value: "monthFirst",
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
// 技能样式列表：评分样式共用十分制数值，标签类样式展示技能文字。
// labelKey 为语言包文案键，value 写入简历的 ui.theme.skillTemplate。
export const skillTemplateList = [
  { labelKey: "skillStyleNone" /* 文本描述样式名称的文案键 */, value: "none" /* 仅显示名称和描述的模板编号 */ },
  { labelKey: "skillStyleTag" /* 标签样式名称的文案键 */, value: "tag" /* 仅显示技能名称的标签模板编号 */ },
  { labelKey: "skillStyleNotion" /* 笔记风样式名称的文案键 */, value: "notion" /* 显示名称和描述的彩色标签模板编号 */ },
  { labelKey: "skillStyleRainbowTag" /* 彩虹标签名称的文案键 */, value: "rainbowTag" /* 仅显示技能名称的彩色标签模板编号 */ },
  { labelKey: "skillStyleBar", value: "bar" }, // 进度条模板
  { labelKey: "skillStyleDot", value: "dot" }, // 圆点模板
  {
    labelKey: "skillStyleDistribution", // 技能占比样式名称的文案键
    value: "distribution", // 技能占比模板编号
  },
  { labelKey: "skillStyleSemiRing" /* 半圆环样式名称 */, value: "semiRing" /* 半圆环模板编号 */ },
  { labelKey: "skillStyleDonut" /* 圆环样式名称 */, value: "donut" /* 圆环模板编号 */ },
  { labelKey: "skillStyleOpenRing" /* 开口圆环样式名称 */, value: "openRing" /* 开口圆环模板编号 */ },
];
// 荣誉证书模板选项：文本描述、笔记风与详情卡片展示描述，其余样式只显示名称。
export const honorTemplateList = [
  { labelKey: "honorStyleTextDescription" /* 文本描述名称的文案键 */, value: "default" /* 显示名称、链接和描述的布局编号 */ },
  { labelKey: "honorStyleTag" /* 标签名称的文案键 */, value: "tag" /* 只显示荣誉名称的布局编号 */ },
  { labelKey: "honorStyleNotion" /* 笔记风名称的文案键 */, value: "notion" /* 显示荣誉名称与描述的彩色布局编号 */ },
  { labelKey: "honorStyleRainbowTag" /* 彩虹标签名称的文案键 */, value: "rainbowTag" /* 只显示荣誉名称的彩色标签布局编号 */ },
  { labelKey: "honorStyleList" /* 清单名称的文案键 */, value: "list" /* 逐条显示荣誉名称的清单布局编号 */ },
  { labelKey: "honorStyleCard" /* 详情卡片名称的文案键 */, value: "card" /* 显示名称、链接和描述的卡片布局编号 */ },
];
// ===========默认值=====================
export const defaultThemeColor = "#50A2FF";
// 新简历默认显示的页尾品牌名，用户清空后保持空值。
export const defaultFooter = "轻舟简历";
// 页尾模板选项由编号选择，后续样式在清单中扩展。
export const footerTemplateList = [
  { labelKey: "footerTemplateTotal" /* 总页数模板名称 */, value: "total" /* 当前页与总页数模板编号 */ },
  { labelKey: "footerTemplateNumber" /* 数字页码模板名称 */, value: "number" /* 数字页码模板编号 */ },
  { labelKey: "footerTemplatePage" /* 文字页码模板名称 */, value: "page" /* 文字页码模板编号 */ },
];
// 页尾默认保留原有的当前页与总页数模板。
export const defaultFooterTemplate = "total" as const;
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
export const defaultUserInfoLayout = "grid";
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
// 默认技能模板：文本描述
export const defaultSkillTemplate = "none";
// 默认链接下划线开关
export const defaultLinkUnderline = false;
// 默认副标题不居中
export const defaultSubtitleCenter = false;
// 默认并列信息使用留白分隔，保持既有模板视觉。
export const defaultInfoSeparator = "space";
// ===========参数范围（编辑器滑杆与一页纸压缩共用，只维护这一处）=====================
export const uiParamRanges = {
  // 上下页边距
  "page.padding.vertical": { min: 12, max: 96, step: 1 },
  // 左右页边距
  "page.padding.horizontal": { min: 12, max: 96, step: 1 },
  // 左栏宽度占比（双栏布局）：上限 80 让右栏可窄到 20%，供右窄版式使用
  "layout.leftColumnWidth": { min: 20, max: 80, step: 1 },
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
    footerTemplate: defaultFooterTemplate, // 页尾模板编号。
  },
  font: {
    family: defaultFontFamily,
    color: "#000", // 正文默认黑色，模板可设置初始值并允许用户选择预设灰度
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
    subtitleCenter: defaultSubtitleCenter,
  },
  theme: {
    color: defaultThemeColor,
    template: defaultThemeTemplate,
    titleTemplate: "auto", // 标题样式默认由主题决定
    skillTemplate: defaultSkillTemplate, // 技能列表默认使用文本描述模板
    userTemplate: "auto", // 个人信息组件默认按版式选用公共组件
    titleIconMode: defaultTitleIconMode,
  },
  layout: {
    columns: null,
    leftColumnWidth: defaultLeftColumnWidth,
  },
  user: {
    infoMode: defaultUserInfoMode,
    infoLayout: defaultUserInfoLayout,
    avatarPosition: defaultAvatarPosition,
    infoPosition: defaultInfoPosition,
  },
  skill: {
    layout: "text", // 默认使用富文本正文布局
    columns: 1, // 熟练度列表默认单栏
  },
  honor: {
    layout: "default" as const, // 默认显示荣誉名称、链接和描述
  },
};
