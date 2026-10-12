/**
 * 通用标题样式登记项：标题样式与主题彻底解耦，选择器、渲染、主题默认标题与标题自身的默认参数共用这一份清单。
 * 主题在 ui.theme.titleTemplate 中指向标题样式编号，标题图标模式与模块标题字号随之由标题样式提供默认值。
 * 每个标题样式自带一套配色与页面留白：模板库的极简分类以默认主题为底板、只覆盖标题，
 * 若不带上各自的颜色与边距，独立样式卡片会长得一模一样。
 */
export interface TitleStyleDefinition {
  id: string; // 标题样式编号，与组件文件名一致
  scope: "standalone" | "theme"; // 独立样式可供用户选择，主题配套样式只随所属主题呈现
  name: string; // 标题样式名称，中文源文案，与页面语言包 resumeTemplateStyle_<编号>_name 同步
  description: string; // 标题样式说明，中文源文案，与页面语言包 resumeTemplateStyle_<编号>_description 同步
  color: string; // 该标题样式模板卡片使用的主题色，取值复用现有主题色
  padding: { // 该标题样式模板卡片使用的页面边距，单位像素
    vertical: number; // 上下页边距
    horizontal: number; // 左右页边距
  };
  spacing?: { // 该标题样式模板卡片使用的段落与模块间距，单位像素，缺省沿用底板主题
    paragraph?: number; // 段落间距
    module?: number; // 模块间距
  };
  titleIconMode?: string; // 该标题样式默认的模块标题图标模式，缺省沿用全局默认
  titleSize?: number; // 该标题样式默认的模块标题字号，缺省沿用全局默认
}

// 清单只登记样式本身，不登记主题归属。
// 配色按语义分配：深色块用深色、浅色底纹用中低饱和色，同色系不重复出现。
export const titleStyleList = [
  { id: "barUnderline", scope: "standalone", name: "竖条细线", description: "标题左侧一道主题色竖条，下接通栏细线。", color: "#50A2FF", padding: { vertical: 24, horizontal: 24 } },
  { id: "centeredShortRule", scope: "standalone", name: "居中短横线", description: "标题居中，下方一小段主题色短横线。", titleIconMode: "icon", color: "#2563EB", padding: { vertical: 30, horizontal: 30 } },
  { id: "railMark", scope: "standalone", name: "引导竖块", description: "标题左侧一道竖向短块，与正文引导线同轴。", color: "#7C8CF4", padding: { vertical: 28, horizontal: 28 } },
  { id: "diamondPrefix", scope: "standalone", name: "菱形前缀", description: "标题前一个主题色菱形。", color: "#BD55D9", padding: { vertical: 26, horizontal: 30 } },
  { id: "darkLabelBar", scope: "standalone", name: "深色标签条", description: "标题落在深灰实色标签上，右侧接浅灰底条。", titleSize: 21, color: "#42536B", padding: { vertical: 24, horizontal: 24 }, spacing: { module: 18 } },
  { id: "barHeavyRule", scope: "standalone", name: "竖条粗线", description: "竖条引导，标题下方一条主题色粗线。", titleSize: 21, color: "#1E3A5F", padding: { vertical: 30, horizontal: 27 } },
  { id: "twinSquareBar", scope: "standalone", name: "双方块条", description: "两个小方块引导，标题落在同色实心条上。", titleSize: 21, color: "#2196F3", padding: { vertical: 27, horizontal: 30 } },
  { id: "diamondTrail", scope: "standalone", name: "菱形尾饰", description: "标题左对齐，右侧一串菱形点收尾。", color: "#9C2342", padding: { vertical: 26, horizontal: 26 } },
  { id: "shortUnderline", scope: "standalone", name: "短下划线", description: "标题下方一条跟随文字宽度的短下划线。", titleSize: 18, color: "#A58D65", padding: { vertical: 30, horizontal: 30 }, spacing: { paragraph: 9, module: 15 } },
  { id: "matchedUnderline", scope: "standalone", name: "同色底线", description: "标题下方一条与标题同色的通栏底线。", color: "#B00035", padding: { vertical: 27, horizontal: 30 } },
  { id: "hairlineRule", scope: "standalone", name: "极细底线", description: "标题只有加宽字距与一条极细底线。", color: "#111827", padding: { vertical: 30, horizontal: 30 }, spacing: { paragraph: 6, module: 9 } },
  { id: "centeredSideRules", scope: "standalone", name: "居中夹线", description: "标题居中，两侧各延伸一条细线。", color: "#0F766E", padding: { vertical: 30, horizontal: 33 } },
  { id: "roundedLabel", scope: "standalone", name: "圆角色块", description: "标题落在主题色圆角实色块上。", titleIconMode: "icon", titleSize: 24, color: "#EA580C", padding: { vertical: 27, horizontal: 27 } },
  { id: "railDotRule", scope: "theme", name: "轴线圆点", description: "标题左侧一个圆点，右侧细线延伸到栏末。", color: "#49BDB6", padding: { vertical: 30, horizontal: 30 }, spacing: { module: 15 } },
  { id: "notchedBanner", scope: "standalone", name: "燕尾旗帜", description: "标题从纸张左缘延伸，右端收成燕尾缺口。", color: "#35B2BA", padding: { vertical: 27, horizontal: 24 } },
  { id: "trailingRule", scope: "standalone", name: "右延细线", description: "标题后一条细线延伸到容器右边。", titleIconMode: "circle", color: "#187F89", padding: { vertical: 30, horizontal: 30 } },
  { id: "boxedTitle", scope: "theme", name: "框内标题", description: "标题位于模块外框顶部，下方一条通栏细线分隔内容。", titleSize: 18, color: "#007F88", padding: { vertical: 30, horizontal: 30 }, spacing: { module: 18 } },
  { id: "titleUnderline", scope: "standalone", name: "通栏底线", description: "标题下方一条通栏细线分隔内容。", color: "#087F8C", padding: { vertical: 24, horizontal: 24 } },
  { id: "barColorTitle", scope: "standalone", name: "圆条标题", description: "圆头竖条与主题色标题文字，右侧细线延伸。", color: "#25677D", padding: { vertical: 30, horizontal: 30 } },
  { id: "barTint", scope: "standalone", name: "竖条底纹", description: "左侧竖条搭配标题行浅色底纹。", color: "#475569", padding: { vertical: 24, horizontal: 24 }, spacing: { module: 18 } },
  { id: "tintOnly", scope: "standalone", name: "浅色底纹", description: "只铺标题行浅色底纹，不画竖条。", color: "#64748B", padding: { vertical: 27, horizontal: 27 }, spacing: { module: 18 } },
  { id: "roundedTabRule", scope: "standalone", name: "圆角标签块", description: "标题落在上圆角实色块上，块底接通栏细线。", color: "#B5093B", padding: { vertical: 27, horizontal: 30 } },
  { id: "rightAlignedTitle", scope: "theme", name: "右对齐标题", description: "标题右对齐，左侧让出日期栏位置。", titleSize: 16, color: "#6864EF", padding: { vertical: 30, horizontal: 33 }, spacing: { module: 15 } },
  { id: "timelineIndent", scope: "theme", name: "时间轴缩进", description: "标题左侧让出时间轴栏宽度。", titleSize: 17, color: "#2F5D8A", padding: { vertical: 30, horizontal: 36 }, spacing: { module: 15 } },
  { id: "solidLabelRule", scope: "standalone", name: "实色块横线", description: "实心色块承载标题，底边接通栏细线。", color: "#1D4ED8", padding: { vertical: 27, horizontal: 27 } },
  { id: "numberedPrefix", scope: "standalone", name: "序号前缀", description: "模块标题前自动补两位序号。", color: "#4056A1", padding: { vertical: 27, horizontal: 30 } },
  { id: "dotTrailRule", scope: "standalone", name: "圆点引线", description: "标题后一个圆点，细线延伸到右边距。", titleIconMode: "circle", color: "#3286D5", padding: { vertical: 27, horizontal: 30 } },
  { id: "beveledLabel", scope: "standalone", name: "斜切色块", description: "标题落在右端斜切的实色块上。", color: "#9B59DC", padding: { vertical: 27, horizontal: 27 } },
  { id: "arcLayers", scope: "standalone", name: "弧尾叠层", description: "标题落在三层渐浅的弧尾色块上，底部通栏细线。", color: "#7C3AED", padding: { vertical: 30, horizontal: 27 } },
  { id: "highlightBrush", scope: "standalone", name: "荧光笔触", description: "标题下方两道错位半透明笔刷。", color: "#C92327", padding: { vertical: 30, horizontal: 30 }, spacing: { paragraph: 9 } },
  { id: "twinTriangleRule", scope: "standalone", name: "双三角引线", description: "标题前一组深浅双三角，右侧细线沿中线延伸。", color: "#B60032", padding: { vertical: 27, horizontal: 30 } },
  { id: "chevronArrow", scope: "standalone", name: "三层箭头", description: "标题落在三层箭头形色块上。", color: "#EE7475", padding: { vertical: 27, horizontal: 30 } },
  { id: "slantedLayers", scope: "standalone", name: "斜切叠片", description: "标题落在斜切色块上，右下方叠一层浅色背片。", color: "#8A6A4F", padding: { vertical: 30, horizontal: 27 } },
  { id: "foldedRibbon", scope: "standalone", name: "折角飘带", description: "标题飘带右端带两道斜纹，左下角折起。", color: "#0369A1", padding: { vertical: 27, horizontal: 24 } },
  { id: "slantedBands", scope: "standalone", name: "斜纹色带", description: "标题落在斜切色块上，右侧接三道渐浅斜纹。", color: "#C2410C", padding: { vertical: 27, horizontal: 27 } },
  { id: "doubleRuleTitle", scope: "standalone", name: "双线夹标题", description: "标题上下各一条线，上线通栏、下线随文字宽度。", titleSize: 17, color: "#000000", padding: { vertical: 33, horizontal: 30 } },
  { id: "solidLabelTrail", scope: "standalone", name: "色块引线", description: "标题落在实色块上，右侧细线接一个圆点。", color: "#0D9488", padding: { vertical: 27, horizontal: 27 } },
] satisfies TitleStyleDefinition[];

/** 标题样式编号 */
export type TitleStyleId = (typeof titleStyleList)[number]["id"];

export const titleStyleRegistry = Object.fromEntries(
  titleStyleList.map((style) => [style.id, style]),
) as Record<TitleStyleId, TitleStyleDefinition>;

// 选择入口只展示可脱离原主题的样式，主题配套样式仍留在完整登记表中供预览解析。
export const standaloneTitleStyleList = titleStyleList.filter((style) => style.scope === "standalone");

// 兜底标题样式：主题未声明标题样式时使用。
export const defaultTitleStyleId: TitleStyleId = "barUnderline";

// 解析标题样式编号：主题声明的编号优先，auto 或缺省回退兜底标题样式，未知编号同样回退兜底。
export const resolveTitleStyleId = (selected?: string): TitleStyleId =>
  selected && selected !== "auto" && selected in titleStyleRegistry
    ? (selected as TitleStyleId)
    : defaultTitleStyleId;

// 按编号读取标题样式声明，供主题预设取标题参数默认值时使用。
export const resolveTitleStyleDefinition = (titleStyleId?: string): TitleStyleDefinition | undefined =>
  titleStyleRegistry[resolveTitleStyleId(titleStyleId)];
