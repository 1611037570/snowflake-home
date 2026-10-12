import type { ThemeTemplateConfig } from "@/domain/resume/theme/styles/createThemeTemplate";
import { titleStyleRegistry, type TitleStyleId } from "@/domain/resume/theme/titleStyles";

interface PlainTitleThemeSpec {
  id: string; // 独立极简主题编号
  titleStyleId: TitleStyleId; // 主题采用的标题样式编号
  color: string; // 主题色
  padding: { // 页面边距，单位像素
    vertical: number; // 上下边距
    horizontal: number; // 左右边距
  };
  spacing?: { // 可选的内容间距，单位像素
    paragraph?: number; // 段落间距
    module?: number; // 模块间距
  };
}

// 已有独立极简主题继续使用原主题编号；这里只补齐尚无独立主题的标题样式。
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
] as const satisfies readonly PlainTitleThemeSpec[];

// 每个编号生成一份真实主题声明；标题组件仍由 titleStyleId 独立选择。
export const plainTitleThemes = plainTitleThemeSpecs.map((spec) => ({
  id: spec.id, // 极简主题编号
  name: titleStyleRegistry[spec.titleStyleId]!.name, // 主题名称沿用对应标题样式的名称
  description: titleStyleRegistry[spec.titleStyleId]!.description, // 主题说明
  localeId: spec.titleStyleId, // 复用标题样式的翻译文案编号
  design: ["single-column", "plain"] as ThemeTemplateConfig["design"], // 单栏极简分类
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
