import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import { titleStyleRegistry, type TitleStyleId } from "@/domain/resume/theme/titleStyles";

interface PlainTitleThemeSpec {
  id: string; // 独立标题主题编号
  titleStyleId: TitleStyleId; // 主题采用的标题样式编号
  color: string; // 主题色
  tier?: "plain" | "minimal"; // 模板分类，缺省为极简
  padding: { // 页面边距，单位像素
    vertical: number; // 上下边距
    horizontal: number; // 左右边距
  };
  spacing?: { // 可选的内容间距，单位像素
    paragraph?: number; // 段落间距
    module?: number; // 模块间距
  };
}

// 已有独立标题主题继续使用原主题编号；这里只补齐尚无独立主题的标题样式。
const plainTitleThemeSpecs = [
  { id: "plainRailMark", titleStyleId: "railMark", color: "#7C8CF4", padding: { vertical: 28, horizontal: 28 } },
  { id: "plainDiamondPrefix", titleStyleId: "diamondPrefix", color: "#BD55D9", padding: { vertical: 26, horizontal: 30 } },
  { id: "plainTwinSquareBar", titleStyleId: "twinSquareBar", color: "#2196F3", padding: { vertical: 27, horizontal: 30 } },
  { id: "plainDiamondTrail", titleStyleId: "diamondTrail", color: "#9C2342", padding: { vertical: 26, horizontal: 26 } },
  { id: "plainShortUnderline", titleStyleId: "shortUnderline", color: "#A58D65", padding: { vertical: 30, horizontal: 30 }, spacing: { paragraph: 9, module: 15 } },
  { id: "plainMatchedUnderline", titleStyleId: "matchedUnderline", color: "#B00035", padding: { vertical: 27, horizontal: 30 } },
  { id: "plainRoundedLabel", titleStyleId: "roundedLabel", color: "#EA580C", padding: { vertical: 27, horizontal: 27 } },
  { id: "plainCapsuleRule", titleStyleId: "capsuleRule", color: "#6683A8", padding: { vertical: 27, horizontal: 27 } },
  { id: "plainSlantedBaseBand", titleStyleId: "slantedBaseBand", color: "#595959", padding: { vertical: 27, horizontal: 27 } },
  { id: "plainTrailingRule", titleStyleId: "trailingRule", color: "#187F89", padding: { vertical: 30, horizontal: 30 } },
  { id: "plainTitleUnderline", titleStyleId: "titleUnderline", color: "#087F8C", padding: { vertical: 24, horizontal: 24 } },
  { id: "plainBarColorTitle", titleStyleId: "barColorTitle", color: "#25677D", padding: { vertical: 30, horizontal: 30 } },
  { id: "plainTintOnly", titleStyleId: "tintOnly", color: "#64748B", padding: { vertical: 27, horizontal: 27 }, spacing: { module: 18 } },
  { id: "plainRoundedTabRule", titleStyleId: "roundedTabRule", color: "#B5093B", padding: { vertical: 27, horizontal: 30 } },
  { id: "plainHighlightBrush", titleStyleId: "highlightBrush", color: "#C92327", padding: { vertical: 30, horizontal: 30 }, spacing: { paragraph: 9 } },
  { id: "plainFoldedRibbon", titleStyleId: "foldedRibbon", color: "#0369A1", padding: { vertical: 27, horizontal: 24 } },
  { id: "plainSlantedBands", titleStyleId: "slantedBands", color: "#C2410C", padding: { vertical: 27, horizontal: 27 } },
  { id: "plainDoubleRuleTitle", titleStyleId: "doubleRuleTitle", color: "#000000", padding: { vertical: 33, horizontal: 30 } },
  { id: "plainSolidLabelTrail", titleStyleId: "solidLabelTrail", color: "#0D9488", padding: { vertical: 27, horizontal: 27 } },
  {
    id: "plainInkSpacedRuleTitle", // 衬线疏朗独立主题编号
    titleStyleId: "inkSpacedRuleTitle", // 复用疏朗细线标题组件
    color: "#91B8AF", // 青灰色标题底线
    padding: { // 页面边距
      vertical: 30, // 页面上下边距
      horizontal: 30, // 页面左右边距
    },
  },
  {
    id: "plainLavenderDotTitle", // 渐变方点独立主题编号
    titleStyleId: "lavenderDotTitle", // 复用渐变方点标题组件
    color: "#7130D9", // 紫色标题文字
    padding: { // 页面边距
      vertical: 30, // 页面上下边距
      horizontal: 30, // 页面左右边距
    },
  },
  {
    id: "plainMintHaloTitle", // 薄荷圆点独立主题编号
    titleStyleId: "mintHaloTitle", // 复用薄荷圆点标题组件
    color: "#13AF9E", // 青绿色标题文字
    padding: { // 页面边距
      vertical: 30, // 页面上下边距
      horizontal: 30, // 页面左右边距
    },
  },
  {
    id: "plainChalkWaveTitle", // 三角波浪独立主题编号
    titleStyleId: "chalkWaveTitle", // 复用三角波浪标题组件
    color: "#39718A", // 浅色纸张上的深蓝标题色
    padding: { // 页面边距
      vertical: 30, // 页面上下边距
      horizontal: 30, // 页面左右边距
    },
  },
  {
    id: "plainPastelDashTitle", // 粉彩虚线独立主题编号
    titleStyleId: "pastelDashTitle", // 复用粉彩虚线标题组件
    color: "#C96F89", // 玫瑰粉主题色
    padding: { // 页面边距
      vertical: 30, // 页面上下边距
      horizontal: 30, // 页面左右边距
    },
  },
  {
    id: "plainNoteGridTab", // 手帐标题签的独立主题编号
    titleStyleId: "noteGridTab", // 复用手帐标题签组件
    color: "#95664D", // 暖棕主题色
    tier: "minimal", // 在简约分类展示
    padding: { // 页面边距
      vertical: 30, // 页面上下边距
      horizontal: 30, // 页面左右边距
    },
  },
  {
    id: "plainFileIndexHeading", // 档案序号细线的独立主题编号
    titleStyleId: "plainFileIndexHeading", // 使用自带序号的独立标题组件
    color: "#3F5568", // 档案蓝主题色
    tier: "minimal", // 在简约分类展示
    padding: { // 页面边距
      vertical: 30, // 页面上下边距
      horizontal: 30, // 页面左右边距
    },
  },
  {
    id: "plainDiagonalStripeBar", // 斜角纹带独立主题编号
    titleStyleId: "diagonalStripeBar", // 复用斜角纹带标题组件
    color: "#78B8D3", // 浅蓝主题色
    padding: { // 页面边距
      vertical: 27, // 页面上下边距
      horizontal: 30, // 页面左右边距
    },
  },
  {
    id: "plainPopCollageTitle", // 撞色色条独立主题编号
    titleStyleId: "popCollageTitle", // 复用拼贴撞色标题组件
    color: "#E96091", // 玫红主题色，标题色条首位与页眉错开
    padding: { // 页面边距
      vertical: 30, // 页面上下边距
      horizontal: 30, // 页面左右边距，让出标题错位背片
    },
  },
  {
    id: "plainColorDotNotesTitle", // 便签色块独立主题编号
    titleStyleId: "colorDotNotesTitle", // 复用便签标题组件，单栏下统一落蓝
    color: "#4E90C9", // 深蓝主题色，保证白色纸张上的正文可读
    padding: { // 页面边距
      vertical: 30, // 页面上下边距
      horizontal: 30, // 页面左右边距
    },
  },
  {
    id: "plainNeonCircuitTitleTheme", // 霓虹光带独立版主题编号
    titleStyleId: "plainNeonCircuitTitle", // 使用自带深色底板的标题组件
    color: "#A32CC0", // 紫红主题色，呼应标题的品红光带
    padding: { // 页面边距
      vertical: 30, // 页面上下边距
      horizontal: 30, // 页面左右边距
    },
  },
  {
    id: "plainCenteredFullRule", // 居中通栏底线独立主题编号
    titleStyleId: "centeredFullRule", // 复用居中通栏底线标题组件
    color: "#E8801E", // 橙色主题色，标题与底线同色
    padding: { // 页面边距
      vertical: 30, // 页面上下边距
      horizontal: 30, // 页面左右边距
    },
  },
  {
    id: "plainSlantedBilingualBar", // 斜切双语独立主题编号
    titleStyleId: "slantedBilingualBar", // 复用斜切双语标题组件
    color: "#2092BE", // 参考图中的蓝色，与斜块、中文标题同色
    padding: { // 页面边距
      vertical: 27, // 页面上下边距
      horizontal: 27, // 页面左右边距
    },
  },
] as const satisfies readonly PlainTitleThemeSpec[];

// 每个编号生成一份真实主题声明；标题组件仍由 titleStyleId 独立选择。
export const plainTitleThemes = plainTitleThemeSpecs.map((spec) => ({
  id: spec.id, // 独立标题主题编号
  name: titleStyleRegistry[spec.titleStyleId]!.name, // 主题名称沿用对应标题样式的名称
  description: titleStyleRegistry[spec.titleStyleId]!.description, // 主题说明
  localeId: spec.titleStyleId, // 复用标题样式的翻译文案编号
  design: ["single-column", "tier" in spec ? spec.tier : "plain"] as ThemeTemplateConfig["design"], // 单栏模板分类
  ui: { // 独立主题的完整预设由公共主题解析器补齐
    theme: { // 主题配色与标题绘制
      color: spec.color, // 主题色
      titleTemplate: spec.titleStyleId, // 标题样式编号
    },
    page: { // 页面边距与可选内容间距
      padding: { ...spec.padding }, // 页面上下与左右边距
      ...("spacing" in spec ? { spacing: spec.spacing /* 段落与模块间距 */ } : {}),
    },
  },
})) satisfies ThemeTemplateConfig[];
