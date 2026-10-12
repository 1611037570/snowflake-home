/** 标题样式只定义标题组件与默认标题参数，页面外观由主题声明。 */
export interface TitleStyleDefinition {
  id: string; // 标题样式编号，与组件文件名一致
  scope: "standalone" | "theme"; // 独立样式可供用户选择，主题配套样式只随所属主题呈现
  name: string; // 标题样式名称
  description: string; // 标题样式说明
  titleIconMode?: string; // 该标题样式默认的模块标题图标模式，缺省沿用全局默认
  titleSize?: number; // 该标题样式默认的模块标题字号，缺省沿用全局默认
}

// 清单只登记标题样式，主题通过 titleTemplate 选择组件。
export const titleStyleList = [
  { id: "barUnderline", scope: "standalone", name: "竖条细线", description: "标题左侧一道主题色竖条，下接通栏细线。" },
  { id: "centeredShortRule", scope: "standalone", name: "居中短横线", description: "标题居中，下方一小段主题色短横线。", titleIconMode: "icon" },
  { id: "railMark", scope: "standalone", name: "引导竖块", description: "标题左侧一道竖向短块，与正文引导线同轴。" },
  { id: "diamondPrefix", scope: "standalone", name: "菱形前缀", description: "标题前一个主题色菱形。" },
  { id: "darkLabelBar", scope: "standalone", name: "深色标签条", description: "标题落在深灰实色标签上，右侧接浅灰底条。", titleSize: 21 },
  { id: "slantedBaseBand", scope: "standalone", name: "斜角底带", description: "标题位于右端斜切的色块上，下方浅灰横带向右延伸。", titleSize: 22 },
  { id: "barHeavyRule", scope: "standalone", name: "竖条粗线", description: "竖条引导，标题下方一条主题色粗线。", titleSize: 21 },
  { id: "twinSquareBar", scope: "standalone", name: "双方块条", description: "两个小方块引导，标题落在同色实心条上。", titleSize: 21 },
  { id: "diamondTrail", scope: "standalone", name: "菱形尾饰", description: "标题左对齐，右侧一串菱形点收尾。" },
  { id: "shortUnderline", scope: "standalone", name: "短下划线", description: "标题下方一条跟随文字宽度的短下划线。", titleSize: 18 },
  { id: "matchedUnderline", scope: "standalone", name: "同色底线", description: "标题下方一条与标题同色的通栏底线。" },
  { id: "hairlineRule", scope: "standalone", name: "极细底线", description: "标题只有加宽字距与一条极细底线。" },
  { id: "centeredSideRules", scope: "standalone", name: "居中夹线", description: "标题居中，两侧各延伸一条细线。" },
  { id: "roundedLabel", scope: "standalone", name: "圆角色块", description: "标题落在主题色圆角实色块上。", titleIconMode: "icon", titleSize: 24 },
  { id: "capsuleRule", scope: "standalone", name: "胶囊横线", description: "标题置于圆角胶囊色块中，细线从右侧水平延伸。", titleSize: 20 },
  { id: "railDotRule", scope: "theme", name: "轴线圆点", description: "标题左侧一个圆点，右侧细线延伸到栏末。" },
  { id: "notchedBanner", scope: "standalone", name: "燕尾旗帜", description: "标题从纸张左缘延伸，右端收成燕尾缺口。" },
  { id: "trailingRule", scope: "standalone", name: "右延细线", description: "标题后一条细线延伸到容器右边。", titleIconMode: "circle" },
  { id: "boxedTitle", scope: "theme", name: "框内标题", description: "标题位于模块外框顶部，下方一条通栏细线分隔内容。", titleSize: 18 },
  { id: "titleUnderline", scope: "standalone", name: "通栏底线", description: "标题下方一条通栏细线分隔内容。" },
  { id: "barColorTitle", scope: "standalone", name: "圆条标题", description: "圆头竖条与主题色标题文字，右侧细线延伸。" },
  { id: "barTint", scope: "standalone", name: "竖条底纹", description: "左侧竖条搭配标题行浅色底纹。" },
  { id: "tintOnly", scope: "standalone", name: "浅色底纹", description: "只铺标题行浅色底纹，不画竖条。" },
  { id: "roundedTabRule", scope: "standalone", name: "圆角标签块", description: "标题落在上圆角实色块上，块底接通栏细线。" },
  { id: "rightAlignedTitle", scope: "theme", name: "右对齐标题", description: "标题右对齐，左侧让出日期栏位置。", titleSize: 16 },
  { id: "timelineIndent", scope: "theme", name: "时间轴缩进", description: "标题左侧让出时间轴栏宽度。", titleSize: 17 },
  { id: "solidLabelRule", scope: "standalone", name: "实色块横线", description: "实心色块承载标题，底边接通栏细线。" },
  { id: "numberedPrefix", scope: "standalone", name: "序号前缀", description: "模块标题前自动补两位序号。" },
  { id: "dotTrailRule", scope: "standalone", name: "圆点引线", description: "标题后一个圆点，细线延伸到右边距。", titleIconMode: "circle" },
  { id: "beveledLabel", scope: "standalone", name: "斜切色块", description: "标题落在右端斜切的实色块上。" },
  { id: "arcLayers", scope: "standalone", name: "弧尾叠层", description: "标题落在三层渐浅的弧尾色块上，底部通栏细线。" },
  { id: "highlightBrush", scope: "standalone", name: "荧光笔触", description: "标题下方两道错位半透明笔刷。" },
  { id: "twinTriangleRule", scope: "standalone", name: "双三角引线", description: "标题前一组深浅双三角，右侧细线沿中线延伸。" },
  { id: "chevronArrow", scope: "standalone", name: "三层箭头", description: "标题落在三层箭头形色块上。" },
  { id: "slantedLayers", scope: "standalone", name: "斜切叠片", description: "标题落在斜切色块上，右下方叠一层浅色背片。" },
  { id: "foldedRibbon", scope: "standalone", name: "折角飘带", description: "标题飘带右端带两道斜纹，左下角折起。" },
  { id: "slantedBands", scope: "standalone", name: "斜纹色带", description: "标题落在斜切色块上，右侧接三道渐浅斜纹。" },
  { id: "doubleRuleTitle", scope: "standalone", name: "双线夹标题", description: "标题上下各一条线，上线通栏、下线随文字宽度。", titleSize: 17 },
  { id: "solidLabelTrail", scope: "standalone", name: "色块引线", description: "标题落在实色块上，右侧细线接一个圆点。" },
  { id: "terraCardRule", scope: "theme", name: "卡片引线", description: "暖色卡片内的标题向右延伸细线。", titleSize: 16 }, // 暖陶卡片配套标题
  {
    id: "noteGridTab", // 手帐标题样式编号
    scope: "standalone", // 供格纸手帐与简约主题共用
    name: "手帐标题签", // 标题样式名称
    description: "浅色标题签搭配手帐虚线。", // 标题样式说明
    titleIconMode: "none", // 默认隐藏模块图标
    titleSize: 18, // 默认标题字号
  },
  { id: "fileIndexHeading", scope: "theme", name: "档案细线", description: "左侧序号对应的纯文字标题与细线。", titleIconMode: "none", titleSize: 18 }, // 序号档案配套标题
  {
    id: "plainFileIndexHeading", // 独立档案序号标题样式编号
    scope: "standalone", // 允许独立选择并生成简约主题
    name: "档案序号细线", // 标题样式名称
    description: "两位模块序号、标题与右延细线组成独立标题。", // 标题样式说明
    titleIconMode: "none", // 默认隐藏模块图标
    titleSize: 18, // 默认标题字号
  },
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
