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

// 主题内部维护条目样式，简历数据只记录自动跟随或指定的主题来源。
const defaultThemeItemStyle = {
  background: "transparent",
  borderColor: "transparent",
  radius: "0",
  padding: 0,
};

const themeItemStyles: Record<string, typeof defaultThemeItemStyle> = {
  default: defaultThemeItemStyle,
  vivid: {
    background: "#EA580C1A",
    borderColor: "#EA580C66",
    radius: "12px",
    padding: 12,
  },
  outline: {
    background: "transparent",
    borderColor: "transparent",
    radius: "0",
    padding: 12,
  },
};

// 默认简历页面背景色
export const defaultPageBackground = "#ffffff";
// 简历页面背景色选项：默认白、极致黑与象牙米白
export const pageBackgroundColors = [
  { name: "backgroundWhite", value: defaultPageBackground },
  { name: "backgroundBlack", value: "#000000" },
  { name: "backgroundIvory", value: "#F5F0E6" },
];

export const getThemeItemStyle = (templateId: string) =>
  themeItemStyles[templateId] || defaultThemeItemStyle;

// 样式模板统一提供完整 UI，避免依赖示例简历自身的 UI 配置。
const createThemeTemplate = (
  name: string,
  id: string,
  description: string,
  ui: Record<string, any>,
) => {
  const baseUi = {
    page: {
      background: defaultPageBackground,
      padding: { vertical: 24, horizontal: 24 },
      spacing: { paragraph: 12, module: 12 },
      footer: "",
    },
    font: {
      family: "text-puhui",
      size: 16,
      titleSize: 22,
      lineHeight: 1.2,
    },
    content: {
      language: "zh",
      textAlign: "auto",
      infoSeparator: "space",
      linkUnderline: false,
      dateStyle: "dot",
      datePosition: "right",
    },
    theme: {
      template: id,
      color: "#50A2FF",
      titleIconMode: "none",
      userModule: "auto",
      module: "auto",
      item: "auto",
    },
    layout: {
      type: "single",
      columns: null,
      leftColumnWidth: 40,
    },
    user: {
      infoMode: "text",
      infoLayout: "flex",
      avatarPosition: "right",
      infoPosition: "left",
    },
  };
  const presetUi = {
    ...baseUi,
    ...ui,
    page: {
      ...baseUi.page,
      ...ui.page,
      padding: { ...baseUi.page.padding, ...ui.page?.padding },
      spacing: { ...baseUi.page.spacing, ...ui.page?.spacing },
    },
    font: { ...baseUi.font, ...ui.font },
    content: { ...baseUi.content, ...ui.content },
    theme: { ...baseUi.theme, ...ui.theme },
    layout: { ...baseUi.layout, ...ui.layout },
    user: { ...baseUi.user, ...ui.user },
  };
  return {
    name,
    id,
    description,
    item: {
      data: {},
      config: {},
      ui: presetUi,
    },
  };
};

// 主题样式列表
export const themeTemplateList = [
  createThemeTemplate("默认", "default", "清晰通用的基础简历样式。", {}),
  createThemeTemplate("现代", "modern", "适合互联网与技术岗位的现代简历样式。", {
    theme: { color: "#2563EB", titleIconMode: "icon" },
    user: { avatarPosition: "center", infoPosition: "center" },
  }),
  createThemeTemplate("商务", "business", "适合职场与商务场景的正式简历样式。", {
    theme: { color: "#1E3A5F" },
    font: { size: 15, titleSize: 21 },
    page: { spacing: { module: 18 } },
    content: { dateStyle: "cn" },
  }),
  createThemeTemplate("简约", "minimal", "减少视觉干扰，突出内容本身的简历样式。", {
    theme: { color: "#111827" },
    page: {
      padding: { vertical: 30, horizontal: 30 },
      spacing: { paragraph: 6, module: 9 },
    },
  }),
  createThemeTemplate("经典", "classic", "适合传统行业与正式投递的经典简历样式。", {
    theme: { color: "#7C3AED", titleIconMode: "icon" },
    font: { family: "text-yyqx" },
    content: { dateStyle: "cn" },
  }),
  createThemeTemplate("学术", "academic", "强调研究经历与文字内容的学术简历样式。", {
    theme: { color: "#0F766E" },
    font: { size: 15, lineHeight: 1.4 },
    content: { textAlign: "justify", dateStyle: "cn" },
  }),
  createThemeTemplate("清新", "fresh", "适合教育、设计与初入职场场景的简历样式。", {
    theme: { color: "#16A34A", titleIconMode: "icon" },
    user: { avatarPosition: "center", infoPosition: "center" },
  }),
  createThemeTemplate("活力", "vivid", "适合运营、市场与创意岗位的活力简历样式。", {
    theme: { color: "#EA580C", titleIconMode: "icon" },
    font: { size: 17, titleSize: 24 },
    user: { infoMode: "icon" },
  }),
  createThemeTemplate("创意", "creative", "突出个人表达与作品展示的创意简历样式。", {
    theme: { color: "#DB2777", titleIconMode: "icon" },
    user: { avatarPosition: "center", infoPosition: "center", infoMode: "icon" },
  }),
  createThemeTemplate("稳重", "steady", "适合经验型岗位与正式求职的稳重简历样式。", {
    theme: { color: "#475569" },
    font: { size: 15, lineHeight: 1.3 },
    page: { spacing: { module: 18 } },
    content: { dateStyle: "cn" },
  }),
  createThemeTemplate("线框", "outline", "以纯黑细线勾勒模块外边框的线框简历样式。", {
    theme: { color: "#000000" },
    font: { titleSize: 18 },
    page: { spacing: { module: 48 } },
    content: { dateStyle: "cn" },
  }),
  createThemeTemplate(
    "通栏双栏",
    "topUserTwoColumn",
    "个人信息顶部通栏，其余模块固定分到左右两栏。",
    {
      theme: { color: "#0F766E" },
      layout: { type: "topUserTwoColumn" },
    },
  ),
  createThemeTemplate("双栏", "twoColumn", "所有模块固定分到左右两栏，适合内容较多的简历。", {
    theme: { color: "#7C3AED" },
    layout: { type: "twoColumn" },
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
