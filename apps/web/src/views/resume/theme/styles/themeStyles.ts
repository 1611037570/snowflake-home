/**
 * 正文区域留白的历史回退值。
 *
 * 正文容器的视觉在 `regionContainer/themes/{mainDefault,frame}.vue`，这里只保留历史留白数字：
 * 升级前留白写在样式表里，老简历的 ui 里没有 `ui.region.main.padding` 声明，
 * 引擎与外观两侧都要取到同一个历史值，否则内边距会与分页扣除值不一致。
 * 新简历由主题显式声明区域留白，不再走这张表。
 */
const legacyMainRegionPadding: Record<string, number> = {
  default: 0, // 通用缺省外观：不占内边距
  mainDefault: 0, // 正文缺省外观：透明底板，不占内边距
  frame: 12, // 正文白色底板：内容向底板内侧收进
  // 以下为历史编号：老简历的 ui.theme.view 可能仍是这些取值
  view: 0, // 历史编号：透明底板
  viewFrame: 12, // 历史编号：白色底板
};

/** 按区域外观编号或历史正文外观编号取历史留白，未知编号按 0 处理 */
export const getLegacyMainRegionPadding = (id: string) => legacyMainRegionPadding[id] ?? 0;
